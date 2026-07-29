import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback, useEffect, useRef, useState } from "react";
import Purchases from "react-native-purchases";

import {
  Alert,
  PanResponder,
  StatusBar as RNStatusBar,
  StyleSheet,
  View,
} from "react-native";
import * as Notifications from "expo-notifications";
import { SchedulableTriggerInputTypes } from "expo-notifications";

import {
  STORAGE_KEY,
  LEGACY_STORAGE_KEY,
  FIRST_TIME_OFFER_KEY,
  MAX_STAMINA,
  STAMINA_RECHARGE_TIME,
  ANIMAL_EVOLUTION_ORDER,
  STARTER_COINS,
  INITIAL_STATS,
  ACTION_COSTS,
  STAMINA_REFILL_COST,
  LOW_STAT_THRESHOLD,
  STAR_PACKS,
} from "../../constants/gameConfig";

import Header from "../../components/header";
import StatusPill from "../../components/status-pill";
import Pet3DViewer from "../../components/pet-3d";
import ActionDock from "../../components/action-dock";
import StoreModal from "../../components/store-modal";

import { Colors, Gradients } from "@/constants/theme";

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

type ActionType = keyof typeof ACTION_COSTS;

export default function HomeScreen() {
  const c = Colors;

  // ─── State ────────────────────────────────────────────────
  const [hunger, setHunger] = useState(INITIAL_STATS.hunger);
  const [happiness, setHappiness] = useState(INITIAL_STATS.happiness);
  const [energy, setEnergy] = useState(INITIAL_STATS.energy);
  const [hygiene, setHygiene] = useState(INITIAL_STATS.hygiene);
  const [coins, setCoins] = useState(STARTER_COINS);
  const [xp, setXp] = useState(0);
  const [stamina, setStamina] = useState(MAX_STAMINA);
  const [isStoreVisible, setIsStoreVisible] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [isPro, setIsPro] = useState(false);
  const [hasSeenFirstOffer, setHasSeenFirstOffer] = useState(true); // default true = don't show until we confirm

  const [tamagotchi, setTamagotchi] = useState({
    type: ANIMAL_EVOLUTION_ORDER?.[0] || "DefaultPet",
    name: "Bubbles",
    level: 1,
  });

  const rotationY = useRef(0);
  const rotationX = useRef(0);
  const startRotationY = useRef(0);
  const startRotationX = useRef(0);

  // Track whether we've already nudged the user for low stats this session
  // (avoid notification spam).
  const lowStatNudgedRef = useRef(false);

  // ─── Notifications: permissions ───────────────────────────
  useEffect(() => {
    (async () => {
      const { status: existing } = await Notifications.getPermissionsAsync();
      let final = existing;
      if (existing !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        final = status;
      }
      if (final !== "granted") console.log("Notification permission denied");
    })();
  }, []);

  // ─── Notifications: schedule engagement pings ─────────────
  // - stamina-full ping (existing)
  // - low-stat ping when any stat drops below threshold (new)
  useEffect(() => {
    const schedule = async () => {
      await Notifications.cancelAllScheduledNotificationsAsync();

      // Stamina-full ping
      if (stamina < MAX_STAMINA && STAMINA_RECHARGE_TIME > 0) {
        const missing = MAX_STAMINA - stamina;
        const seconds = (missing * STAMINA_RECHARGE_TIME) / 1000;
        await Notifications.scheduleNotificationAsync({
          content: {
            title: "Energy full! ⚡",
            body: `${tamagotchi?.name || "Your pet"} is ready to play again — ${MAX_STAMINA} actions waiting.`,
            sound: true,
          },
          trigger: {
            type: SchedulableTriggerInputTypes.TIME_INTERVAL,
            channelId: "stamina-recharge",
            seconds,
            repeats: false,
          },
        });
      }

      // Low-stat ping — fires 2 hours after any stat is critically low
      const lowest = Math.min(hunger, happiness, energy, hygiene);
      if (lowest < LOW_STAT_THRESHOLD) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: `${tamagotchi?.name || "Your pet"} needs you 🥺`,
            body: "Some stats are getting low — pop back in to check on them.",
            sound: true,
          },
          trigger: {
            type: SchedulableTriggerInputTypes.TIME_INTERVAL,
            channelId: "stamina-recharge",
            seconds: 2 * 60 * 60, // 2h
            repeats: false,
          },
        });
      }
    };
    schedule();
  }, [stamina, hunger, happiness, energy, hygiene, tamagotchi?.name]);

  // ─── RevenueCat: fetch offerings ──────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const offerings = await Purchases.getOfferings();
        if (
          offerings.current !== null &&
          offerings.current.availablePackages.length !== 0
        ) {
          setProducts(offerings.current.availablePackages);
        }
      } catch (err) {
        console.warn("RevenueCat error:", err);
      }
    })();
  }, []);

  // ─── First-time offer flag ────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const seen = await AsyncStorage.getItem(FIRST_TIME_OFFER_KEY);
        setHasSeenFirstOffer(seen === "true");
      } catch {
        setHasSeenFirstOffer(false);
      }
    })();
  }, []);

  // ─── AsyncStorage: load + offline decay (with v5→v6 migration) ────
  useEffect(() => {
    (async () => {
      try {
        let stored = await AsyncStorage.getItem(STORAGE_KEY);

        // Migrate v5 users: read their old data, seed v6, delete v5 key.
        if (!stored) {
          const legacy = await AsyncStorage.getItem(LEGACY_STORAGE_KEY);
          if (legacy) {
            await AsyncStorage.setItem(STORAGE_KEY, legacy);
            await AsyncStorage.removeItem(LEGACY_STORAGE_KEY);
            stored = legacy;
          }
        }

        if (!stored) return;

        const parsed = JSON.parse(stored);
        if (parsed.tamagotchi) setTamagotchi(parsed.tamagotchi);
        if (parsed.xp !== undefined) setXp(parsed.xp);
        if (parsed.coins !== undefined) setCoins(parsed.coins);

        if (parsed.lastSavedTime) {
          const timePassed = Date.now() - parsed.lastSavedTime;
          const decayTicks =
            STAT_DECAY_INTERVAL > 0
              ? Math.floor(timePassed / STAT_DECAY_INTERVAL)
              : 0;

          if (parsed.stamina !== undefined) {
            const recover =
              STAMINA_RECHARGE_TIME > 0
                ? Math.floor(timePassed / STAMINA_RECHARGE_TIME)
                : 0;
            setStamina(Math.min(MAX_STAMINA, parsed.stamina + recover));
          }
          if (parsed.hunger !== undefined)
            setHunger(Math.max(0, parsed.hunger - decayTicks));
          if (parsed.happiness !== undefined)
            setHappiness(Math.max(0, parsed.happiness - decayTicks));
          if (parsed.energy !== undefined)
            setEnergy(Math.max(0, parsed.energy - decayTicks));
          if (parsed.hygiene !== undefined)
            setHygiene(Math.max(0, parsed.hygiene - decayTicks));
        } else {
          if (parsed.hunger !== undefined) setHunger(parsed.hunger);
          if (parsed.happiness !== undefined) setHappiness(parsed.happiness);
          if (parsed.energy !== undefined) setEnergy(parsed.energy);
          if (parsed.hygiene !== undefined) setHygiene(parsed.hygiene);
          if (parsed.stamina !== undefined) setStamina(parsed.stamina);
        }
      } catch (error) {
        console.error("Error loading data", error);
      }
    })();
  }, []);

  // ─── AsyncStorage: persist ────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const data = {
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
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      } catch (error) {
        console.error("Error saving data", error);
      }
    })();
  }, [tamagotchi, hunger, happiness, energy, hygiene, xp, coins, stamina]);

  // ─── Active intervals ─────────────────────────────────────
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

  // ─── Evolution ────────────────────────────────────────────
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
      // Evolution rewards a small XP bounty, NOT a big coin injection —
      // resetting balance to zero-ish keeps the paywall pressure on.
      setCoins((prev) => prev + 25);

      Alert.alert(
        "🎉 Evolution!",
        `Your pet evolved to level ${nextLevel} and transformed into a ${nextAnimal}!`,
      );
      rotationY.current = 0;
      rotationX.current = 0;
    }
  }, [xp, tamagotchi.level, tamagotchi.type]);

  // ─── First-time offer surfacing ───────────────────────────
  const openStore = useCallback(() => {
    setIsStoreVisible(true);
  }, []);

  const dismissFirstOffer = useCallback(async () => {
    try {
      await AsyncStorage.setItem(FIRST_TIME_OFFER_KEY, "true");
    } catch {}
    setHasSeenFirstOffer(true);
  }, []);

  // ─── Action gains (structured for clarity) ────────────────
  const ACTION_GAINS: Record<
    ActionType,
    {
      hungerGained?: number;
      happinessGained?: number;
      energyGained?: number;
      energyLost?: number;
      hygieneGained?: number;
      hygieneLost?: number;
      xpGained: number;
    }
  > = {
    feed: { hungerGained: 20, xpGained: 6 },
    clean: { hygieneGained: 40, xpGained: 4 },
    play: { happinessGained: 20, energyLost: 8, hygieneLost: 10, xpGained: 8 },
    sleep: { energyGained: 30, xpGained: 4 },
  };

  const handleAction = (type: ActionType) => {
    const cost = ACTION_COSTS[type];
    const gain = ACTION_GAINS[type];
    if (cost === undefined || !gain) return;

    if (stamina < 1) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      openStore();
      return;
    }
    if (coins < cost) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      // Skip the alert — the store opening IS the feedback.
      openStore();
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setStamina((prev) => prev - 1);
    setCoins((prev) => prev - cost);

    if (gain.hungerGained !== undefined)
      setHunger((prev) => Math.min(100, prev + gain.hungerGained!));
    if (gain.happinessGained !== undefined)
      setHappiness((prev) => Math.min(100, prev + gain.happinessGained!));
    if (gain.energyGained !== undefined)
      setEnergy((prev) => Math.min(100, prev + gain.energyGained!));
    if (gain.energyLost !== undefined)
      setEnergy((prev) => Math.max(0, prev - gain.energyLost!));
    if (gain.hygieneGained !== undefined)
      setHygiene((prev) => Math.min(100, prev + gain.hygieneGained!));
    if (gain.hygieneLost !== undefined)
      setHygiene((prev) => Math.max(0, prev - gain.hygieneLost!));
    setXp((prev) => prev + gain.xpGained);
  };

  // ─── RevenueCat: purchase ─────────────────────────────────
  const handlePurchase = async (productId: string) => {
    const packageToBuy = products.find(
      (p) => p?.product?.identifier === productId,
    );
    if (!packageToBuy) {
      Alert.alert(
        "Store unavailable",
        "Purchases aren't available right now. Please try again later.",
      );
      return;
    }

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const { customerInfo, productIdentifier } =
        await Purchases.purchasePackage(packageToBuy);

      // Match against the STAR_PACKS registry — single source of truth.
      const pack = Object.values(STAR_PACKS).find(
        (p) => p.id === productIdentifier,
      );
      if (pack) {
        setCoins((prev) => prev + pack.coins);
      }

      if (
        typeof customerInfo.entitlements.active["My Tamagotchi Pro"] !==
        "undefined"
      ) {
        setIsPro(true);
      }

      // If this was the first-ever purchase, mark the offer flag so we
      // don't badge it as "first-time" forever.
      if (!hasSeenFirstOffer) await dismissFirstOffer();

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Success!", "Purchase completed successfully.");
      setIsStoreVisible(false);
    } catch (err: any) {
      if (!err?.userCancelled) {
        console.error("Purchase error:", err);
        Alert.alert("Error", "Could not complete the purchase right now.");
      }
    }
  };

  const buyStamina = () => {
    if (stamina >= MAX_STAMINA)
      return Alert.alert("Full Energy", "Your energy is already at maximum!");
    if (coins < STAMINA_REFILL_COST) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return Alert.alert(
        "Not enough stars",
        `You need ${STAMINA_REFILL_COST} stars to refill your energy.`,
      );
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setCoins((prev) => prev - STAMINA_REFILL_COST);
    setStamina(MAX_STAMINA);
  };

  // ─── 3D rotation ──────────────────────────────────────────
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
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <RNStatusBar barStyle="dark-content" />
      <LinearGradient
        colors={Gradients.app}
        style={StyleSheet.absoluteFill}
      />

      <Header
        tamagotchi={tamagotchi}
        xp={xp}
        stamina={stamina}
        coins={coins}
        onOpenStore={openStore}
      />

      <View style={styles.statusGrid}>
        <StatusPill
          label="Hunger"
          value={hunger}
          color={c.stat.hunger}
          icon="food-apple"
        />
        <StatusPill
          label="Mood"
          value={happiness}
          color={c.stat.mood}
          icon="emoticon-happy"
        />
        <StatusPill
          label="Energy"
          value={energy}
          color={c.stat.energy}
          icon="lightning-bolt"
        />
        <StatusPill
          label="Hygiene"
          value={hygiene}
          color={c.stat.hygiene}
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

      <ActionDock onAction={handleAction} coins={coins} />

      <StoreModal
        visible={isStoreVisible}
        onClose={() => setIsStoreVisible(false)}
        onBuyStamina={buyStamina}
        onPurchase={handlePurchase}
        products={products}
        showFirstTimeOffer={!hasSeenFirstOffer}
        onFirstOfferSeen={dismissFirstOffer}
        staminaRefillCost={STAMINA_REFILL_COST}
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
