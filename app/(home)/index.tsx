import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef, useState } from "react";

import * as Notifications from "expo-notifications";
import {
  Alert,
  PanResponder,
  StatusBar as RNStatusBar,
  StyleSheet,
  View,
} from "react-native";

// REVENUECAT: Importe o SDK do RevenueCat
// import Purchases from "react-native-purchases";

// Constantes e Configurações
import {
  ANIMAL_EVOLUTION_ORDER,
  MAX_STAMINA,
  STAMINA_RECHARGE_TIME,
  STORAGE_KEY,
} from "../../constants/gameConfig";

// Componentes
import ActionDock from "@/components/action-dock";
import Pet3DViewer from "@/components/pet-3d";
import Header from "../../components/header";
import StatusPill from "../../components/status-pill";
import StoreModal from "../../components/store-modal";

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

  // REVENUECAT: Estado para guardar os pacotes que virão da API
  const [packages, setPackages] = useState([]);

  console.log("Pacotes disponíveis do RevenueCat:", packages);

  const [tamagotchi, setTamagotchi] = useState({
    type: ANIMAL_EVOLUTION_ORDER?.[0] || "DefaultPet",
    name: "Bubbles",
    level: 1,
  });

  const rotationY = useRef(0);
  const rotationX = useRef(0);
  const startRotationY = useRef(0);
  const startRotationX = useRef(0);

  // --- REVENUECAT: Buscar Ofertas (Offerings) ---
  // useEffect(() => {
  //   const fetchOfferings = async () => {
  //     try {
  //       const offerings = await Purchases.getOfferings();
  //       if (
  //         offerings.current !== null &&
  //         offerings.current.availablePackages.length !== 0
  //       ) {
  //         // Atualiza o estado com os pacotes configurados no RevenueCat
  //         setPackages(offerings.current.availablePackages);
  //       }
  //     } catch (e) {
  //       console.error("Erro ao buscar pacotes do RevenueCat:", e);
  //     }
  //   };

  //   fetchOfferings();
  // }, []);

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

  // --- AsyncStorage: Carregamento e Decaimento Offline ---
  // ... (Seu useEffect de carregamento permanece igual)
  useEffect(() => {
    const getAsyncStorage = async () => {
      try {
        const storedData = await AsyncStorage.getItem(STORAGE_KEY);
        if (storedData) {
          const parsedData = JSON.parse(storedData);
          if (parsedData.tamagotchi) setTamagotchi(parsedData.tamagotchi);
          if (parsedData.xp !== undefined) setXp(parsedData.xp);
          if (parsedData.coins !== undefined) setCoins(parsedData.coins);

          if (parsedData.lastSavedTime) {
            const timePassed = Date.now() - parsedData.lastSavedTime;
            const decayTicks =
              STAT_DECAY_INTERVAL > 0
                ? Math.floor(timePassed / STAT_DECAY_INTERVAL)
                : 0;

            if (parsedData.stamina !== undefined) {
              const staminaToRecover =
                STAMINA_RECHARGE_TIME > 0
                  ? Math.floor(timePassed / STAMINA_RECHARGE_TIME)
                  : 0;
              setStamina(
                Math.min(MAX_STAMINA, parsedData.stamina + staminaToRecover),
              );
            }

            if (parsedData.hunger !== undefined)
              setHunger(Math.max(0, parsedData.hunger - decayTicks));
            if (parsedData.happiness !== undefined)
              setHappiness(Math.max(0, parsedData.happiness - decayTicks));
            if (parsedData.energy !== undefined)
              setEnergy(Math.max(0, parsedData.energy - decayTicks));
            if (parsedData.hygiene !== undefined)
              setHygiene(Math.max(0, parsedData.hygiene - decayTicks));
          } else {
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
    const staminaInterval = setInterval(() => {
      setStamina((prev) => (prev < MAX_STAMINA ? prev + 1 : prev));
    }, STAMINA_RECHARGE_TIME || 60000);

    const statsInterval = setInterval(() => {
      setHunger((prev) => Math.max(0, prev - 1));
      setHappiness((prev) => Math.max(0, prev - 1));
      setEnergy((prev) => Math.max(0, prev - 1));
      setHygiene((prev) => Math.max(0, prev - 1));
    }, STAT_DECAY_INTERVAL || 60000);

    return () => {
      clearInterval(staminaInterval);
      clearInterval(statsInterval);
    };
  }, []);

  // --- Lógica de Evolução ---
  // ... (Mantido exatamente como o seu original)
  useEffect(() => {
    if (xp >= 100) {
      if (tamagotchi.level >= 7) {
        setXp(100);
        return;
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      const nextLevel = tamagotchi.level + 1;
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
    // ... (Mantido exatamente como o seu original)
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

  // --- REVENUECAT: Lógica de Compra com Dinheiro Real ---
  const handleBuy = async (pkg) => {
    console.log(pkg, "package selecionado para compra");

    try {
      const { customerInfo } = await Purchases.purchasePackage(
        packages?.find((item) => item?.identifier === pkg),
      );

      console.log(customerInfo, "informações do cliente após compra");

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Sucesso!", "Compra realizada com sucesso.");

      // Aqui você define a lógica para entregar a recompensa com base no identificador
      // Exemplo: se o ID do pacote for 'coins_500', damos 500 moedas.
      const productId = pkg;

      if (productId.includes("100")) {
        setCoins((prev) => prev + 100);
      } else if (productId.includes("500")) {
        setCoins((prev) => prev + 500);
      } else if (productId.includes("1000")) {
        setCoins((prev) => prev + 1000);
      } else {
        // Fallback genérico caso o ID não tenha números explícitos
        setCoins((prev) => prev + 50);
      }
    } catch (e) {
      if (!e.userCancelled) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert("Erro na compra", e.message);
      }
    }
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

      {/* REVENUECAT: Passando as ofertas para o componente e o novo handleBuy */}
      <StoreModal
        visible={isStoreVisible}
        onClose={() => setIsStoreVisible(false)}
        onBuyStamina={buyStamina}
        onPurchase={handleBuy} // Agora passa o objeto do pacote inteiro
        products={packages} // Passa o estado que populamos pelo RevenueCat
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
