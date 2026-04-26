"use client";

import { useState, useEffect, useCallback } from 'react';
import { differenceInCalendarDays, isToday, parseISO } from 'date-fns';
import { type UserProgress, type CheckInData, rewards } from '@/lib/data';

const PROGRESS_KEY = 'sel_user_progress';

const initialProgress: UserProgress = {
  checkIns: [],
  lastCheckIn: null,
  currentStreak: 0,
  longestStreak: 0,
  badges: [],
};

export function useUserProgress() {
  const [progress, setProgress] = useState<UserProgress>(initialProgress);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const savedProgress = localStorage.getItem(PROGRESS_KEY);
      if (savedProgress) {
        setProgress(JSON.parse(savedProgress));
      }
    } catch (error) {
      console.error("Failed to load user progress from localStorage", error);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
      } catch (error) {
        console.error("Failed to save user progress to localStorage", error);
      }
    }
  }, [progress, isLoaded]);

  const addCheckIn = useCallback((emotionId: string, intensity: number) => {
    setProgress(prev => {
      const now = new Date();
      const todayISO = now.toISOString();

      const newCheckIn: CheckInData = {
        emotionId,
        intensity,
        date: todayISO,
      };

      const newCheckIns = [...prev.checkIns, newCheckIn];

      let currentStreak = prev.currentStreak;
      let lastCheckIn = prev.lastCheckIn;

      if (lastCheckIn) {
        const lastCheckInDate = parseISO(lastCheckIn);
        if (!isToday(lastCheckInDate)) {
           const diff = differenceInCalendarDays(now, lastCheckInDate);
           if (diff === 1) {
             currentStreak += 1;
           } else {
             currentStreak = 1;
           }
        }
      } else {
        currentStreak = 1;
      }
      
      lastCheckIn = todayISO;

      const longestStreak = Math.max(prev.longestStreak, currentStreak);

      const newBadges = rewards
        .filter(reward => currentStreak >= reward.streak)
        .map(reward => reward.id);
      
      const allBadges = Array.from(new Set([...prev.badges, ...newBadges]));

      return {
        checkIns: newCheckIns,
        lastCheckIn,
        currentStreak,
        longestStreak,
        badges: allBadges,
      };
    });
  }, []);

  return { progress, addCheckIn, isLoaded };
}
