import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  PanResponder,
  StatusBar as RNStatusBar,
  StyleSheet,
  View,
  Platform,
} from "react-native";
import * as RNIap from "react-native-iap";
import * as Notifications from "expo-notifications";

// Constantes e Configurações
import {
  STORAGE_KEY,
  MAX_STAMINA,
  STAMINA_RECHARGE_TIME,
  ANIMAL_EVOLUTION_ORDER,
  itemSKUs,
} from "../../constants/gameConfig";

// Componentes
import Header from "../../components/header";
import StatusPill from "../../components/status-pill";
import Pet3DViewer from "../../components/pet-3d";
import ActionDock from "../../components/action-dock";
import StoreModal from "../../components/store-modal";

// Constante de decaimento dos status (60000ms = 1 minuto)
const STAT_DECAY_INTERVAL = 60000;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function HomeScreen() {
  const [hunger, setHunger] = useState(60);
  const [happiness, setHappiness] = useState(40);
  const [energy, setEnergy] = useState(90);
  const [hygiene, setHygiene] = useState(100);
  const [coins, setCoins] = useState(250);
  const [xp, setXp] = useState(0);
  const [stamina, setStamina] = useState(MAX_STAMINA);
  const [isStoreVisible, setIsStoreVisible] = useState(false);
  const [products, setProducts] = useState([]);

  const [tamagotchi, setTamagotchi] = useState({
    type: ANIMAL_EVOLUTION_ORDER?.[0] || "DefaultPet",
    name: "Bubbles",
    level: 1,
  });

  const rotationY = useRef(0);
  const rotationX = useRef(0);
  const startRotationY = useRef(0);
  const startRotationX = useRef(0);

  // --- Efeitos de Permissão e Notificação ---
  useEffect(() => {
    async function requestPermissions() {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();

      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted")
        console.log("Notification permission denied!");
    }
    requestPermissions();
  }, []);

  useEffect(() => {
    const scheduleStaminaNotification = async () => {
      await Notifications.cancelAllScheduledNotificationsAsync();
      if (stamina < MAX_STAMINA && STAMINA_RECHARGE_TIME > 0) {
        // Proteção de divisão por zero
        const missingStamina = MAX_STAMINA - stamina;
        const timeToFullSeconds =
          (missingStamina * STAMINA_RECHARGE_TIME) / 1000;

        await Notifications.scheduleNotificationAsync({
          content: {
            title: "Energy full! ⚡",
            body: `${tamagotchi?.name || "Your pet"} has rested and has ${MAX_STAMINA} actions available. Come play!`,
            sound: true,
          },
          trigger: {
            type: "timeInterval",
            channelId: "stamina-recharge",
            seconds: timeToFullSeconds,
            repeats: false,
          },
        });
      }
    };
    scheduleStaminaNotification();
  }, [stamina, tamagotchi?.name]);

  // --- Efeitos de Compras ---
  useEffect(() => {
    let purchaseUpdateSubscription;
    let purchaseErrorSubscription;

    const initIAP = async () => {
      try {
        await RNIap.initConnection();
        // Proteção: Garante que itemSKUs existe e não está vazio antes de chamar a API
        if (Platform.OS === "ios" && itemSKUs && itemSKUs.length > 0) {
          const items = await RNIap.fetchProducts({ skus: itemSKUs });

          setProducts(items);
        }
      } catch (err) {
        console.warn("Error connecting to the store:", err?.message || err);
      }
    };

    initIAP();

    purchaseUpdateSubscription = RNIap.purchaseUpdatedListener(
      async (purchase) => {
        // Proteção: Garante que o objeto purchase e o receipt existem
        if (purchase && purchase.transactionId && purchase.productId) {
          try {
            if (purchase.productId === "com.tamagotchi.pacotebasico_500")
              setCoins((prev) => prev + 500);
            else if (purchase.productId === "com.tamagotchi.bauestrelas_1500")
              setCoins((prev) => prev + 1500);

            await RNIap.finishTransaction({ purchase, isConsumable: true });
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Alert.alert("Success!", "Stars have been added to your account.");
            setIsStoreVisible(false);
          } catch (error) {
            console.error("Error finishing purchase:", error);
          }
        }
      },
    );

    purchaseErrorSubscription = RNIap.purchaseErrorListener((error) => {
      if (error && error.code !== RNIap.ErrorCode.UserCancelled)
        Alert.alert("Error", "Purchase failed. Please try again.");
    });

    return () => {
      if (purchaseUpdateSubscription) purchaseUpdateSubscription.remove();
      if (purchaseErrorSubscription) purchaseErrorSubscription.remove();
      RNIap.endConnection();
    };
  }, []);

  // --- AsyncStorage: Carregamento e Decaimento Offline ---
  useEffect(() => {
    const getAsyncStorage = async () => {
      try {
        const storedData = await AsyncStorage.getItem(STORAGE_KEY);
        if (storedData) {
          const parsedData = JSON.parse(storedData);
          if (parsedData.tamagotchi) setTamagotchi(parsedData.tamagotchi);
          if (parsedData.xp !== undefined) setXp(parsedData.xp);
          if (parsedData.coins !== undefined) setCoins(parsedData.coins);

          // Lógica de decaimento baseada no tempo offline
          if (parsedData.lastSavedTime) {
            const timePassed = Date.now() - parsedData.lastSavedTime;

            // Proteção: Evita divisão por zero ou valores NaN
            const decayTicks =
              STAT_DECAY_INTERVAL > 0
                ? Math.floor(timePassed / STAT_DECAY_INTERVAL)
                : 0;

            // Recuperação de Stamina
            if (parsedData.stamina !== undefined) {
              const staminaToRecover =
                STAMINA_RECHARGE_TIME > 0
                  ? Math.floor(timePassed / STAMINA_RECHARGE_TIME)
                  : 0;
              setStamina(
                Math.min(MAX_STAMINA, parsedData.stamina + staminaToRecover),
              );
            }

            // Aplica o decaimento garantindo que não fique menor que 0
            if (parsedData.hunger !== undefined)
              setHunger(Math.max(0, parsedData.hunger - decayTicks));
            if (parsedData.happiness !== undefined)
              setHappiness(Math.max(0, parsedData.happiness - decayTicks));
            if (parsedData.energy !== undefined)
              setEnergy(Math.max(0, parsedData.energy - decayTicks));
            if (parsedData.hygiene !== undefined)
              setHygiene(Math.max(0, parsedData.hygiene - decayTicks));
          } else {
            // Fallback se não tiver lastSavedTime
            if (parsedData.hunger !== undefined) setHunger(parsedData.hunger);
            if (parsedData.happiness !== undefined)
              setHappiness(parsedData.happiness);
            if (parsedData.energy !== undefined) setEnergy(parsedData.energy);
            if (parsedData.hygiene !== undefined)
              setHygiene(parsedData.hygiene);
            if (parsedData.stamina !== undefined)
              setStamina(parsedData.stamina);
          }
        }
      } catch (error) {
        console.error("Error loading data", error);
      }
    };
    getAsyncStorage();
  }, []);

  // --- AsyncStorage: Salvamento ---
  useEffect(() => {
    const saveData = async () => {
      try {
        const dataToSave = {
          tamagotchi,
          hunger,
          happiness,
          energy,
          hygiene,
          xp,
          coins,
          stamina,
          lastSavedTime: Date.now(),
        };
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
      } catch (error) {
        console.error("Error saving data", error);
      }
    };
    saveData();
  }, [tamagotchi, hunger, happiness, energy, hygiene, xp, coins, stamina]);

  // --- Intervalos de Tempo Ativos ---
  useEffect(() => {
    // Intervalo para recuperar Stamina do jogador
    const staminaInterval = setInterval(() => {
      setStamina((prev) => (prev < MAX_STAMINA ? prev + 1 : prev));
    }, STAMINA_RECHARGE_TIME || 60000); // Fallback de segurança

    // Intervalo para decaimento dos status do Pet
    const statsInterval = setInterval(() => {
      setHunger((prev) => Math.max(0, prev - 1));
      setHappiness((prev) => Math.max(0, prev - 1));
      setEnergy((prev) => Math.max(0, prev - 1));
      setHygiene((prev) => Math.max(0, prev - 1));
    }, STAT_DECAY_INTERVAL || 60000); // Fallback de segurança

    return () => {
      clearInterval(staminaInterval);
      clearInterval(statsInterval);
    };
  }, []);

  // --- Lógica de Evolução ---
  useEffect(() => {
    if (xp >= 100) {
      if (tamagotchi.level >= 7) {
        setXp(100);
        return;
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      const nextLevel = tamagotchi.level + 1;

      // Proteção: Garante que nextAnimal sempre receba um valor válido e não "undefined"
      const nextAnimal =
        ANIMAL_EVOLUTION_ORDER?.[nextLevel - 1] ||
        ANIMAL_EVOLUTION_ORDER?.[ANIMAL_EVOLUTION_ORDER.length - 1] ||
        tamagotchi.type;

      setTamagotchi((prev) => ({
        ...prev,
        level: nextLevel,
        type: nextAnimal,
      }));
      setXp((prev) => prev - 100);
      setCoins((prev) => prev + 100);

      Alert.alert(
        "🎉 Evolution!",
        `Your pet evolved to level ${nextLevel} and transformed into a ${nextAnimal}!`,
      );
      rotationY.current = 0;
      rotationX.current = 0;
    }
  }, [xp, tamagotchi.level, tamagotchi.type]);

  // --- Interações do Jogo ---
  const handleAction = (type) => {
    const actionConfig = {
      feed: { staminaCost: 1, coinCost: 10, hungerGained: 15, xpGained: 5 },
      clean: { staminaCost: 1, coinCost: 2, hygieneGained: 40, xpGained: 4 },
      play: {
        staminaCost: 1,
        coinCost: 5,
        happinessGained: 15,
        energyLost: 10,
        hygieneLost: 15,
        xpGained: 8,
      },
      sleep: { staminaCost: 1, coinCost: 0, energyGained: 25, xpGained: 4 },
    };

    const action = actionConfig[type];

    // Proteção se o tipo de ação não existir no mapeamento
    if (!action) return;

    if (stamina < action.staminaCost) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setIsStoreVisible(true);
      return;
    }

    if (coins < action.coinCost) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(
        "Out of Stars ⭐",
        "You need to buy more stars in the store!",
      );
      setIsStoreVisible(true);
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setStamina((prev) => prev - action.staminaCost);
    setCoins((prev) => prev - action.coinCost);

    if (type === "feed") {
      setHunger((prev) => Math.min(100, prev + action.hungerGained));
      setXp((prev) => prev + action.xpGained);
    }
    if (type === "clean") {
      setHygiene((prev) => Math.min(100, prev + action.hygieneGained));
      setXp((prev) => prev + action.xpGained);
    }
    if (type === "play") {
      setHappiness((prev) => Math.min(100, prev + action.happinessGained));
      setEnergy((prev) => Math.max(0, prev - action.energyLost));
      setHygiene((prev) => Math.max(0, prev - action.hygieneLost));
      setXp((prev) => prev + action.xpGained);
    }
    if (type === "sleep") {
      setEnergy((prev) => Math.min(100, prev + action.energyGained));
      setXp((prev) => prev + action.xpGained);
    }
  };

  const handlePurchase = async (sku: string) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      await RNIap.requestPurchase({
        request: {
          apple: { sku: sku },
        },
        type: "in-app",
        useAlternativeBilling: false,
      });
    } catch (err) {
      Alert.alert("Warning", "Could not start the purchase right now.");
    }
  };

  const buyStamina = () => {
    const STAMINA_COST = 100;
    if (stamina >= MAX_STAMINA)
      return Alert.alert("Full Energy", "Your energy is already at maximum!");
    if (coins < STAMINA_COST) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return Alert.alert(
        "Insufficient Balance",
        "You need more stars to buy energy.",
      );
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setCoins((prev) => prev - STAMINA_COST);
    setStamina(MAX_STAMINA);
  };

  // --- Rotação ---
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        startRotationY.current = rotationY.current;
        startRotationX.current = rotationX.current;
      },
      onPanResponderMove: (_, gestureState) => {
        rotationY.current = startRotationY.current + gestureState.dx * 0.01;
        const newRotX = startRotationX.current + gestureState.dy * 0.01;
        rotationX.current = Math.max(-0.5, Math.min(0.5, newRotX));
      },
    }),
  ).current;

  return (
    <View style={styles.container}>
      <RNStatusBar barStyle="dark-content" />
      <LinearGradient
        colors={["#E8E8ED", "#F2F2F7"]}
        style={StyleSheet.absoluteFill}
      />

      <Header
        tamagotchi={tamagotchi}
        xp={xp}
        stamina={stamina}
        coins={coins}
        onOpenStore={() => setIsStoreVisible(true)}
      />

      <View style={styles.statusGrid}>
        <StatusPill
          label="Hunger"
          value={hunger}
          color="#FF3B30"
          icon="food-apple"
        />
        <StatusPill
          label="Mood"
          value={happiness}
          color="#FF9500"
          icon="emoticon-happy"
        />
        <StatusPill
          label="Energy"
          value={energy}
          color="#34C759"
          icon="lightning-bolt"
        />
        <StatusPill
          label="Hygiene"
          value={hygiene}
          color="#007AFF"
          icon="shower"
        />
      </View>

      <Pet3DViewer
        type={tamagotchi?.type}
        rotationY={rotationY}
        rotationX={rotationX}
        panHandlers={panResponder.panHandlers}
        isBathing={hygiene < 50}
      />

      <ActionDock onAction={handleAction} />

      <StoreModal
        visible={isStoreVisible}
        onClose={() => setIsStoreVisible(false)}
        onBuyStamina={buyStamina}
        onPurchase={handlePurchase}
        products={products}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F2F2F7", paddingHorizontal: 24 },
  statusGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
    marginTop: 28,
  },
});
