function finishSession(isMastered = false) {
    cleanupListeners();
    
    if (state.dailySession) {
      state.dailySession.completedToday = Math.max(state.dailySession.completedToday || 0, totalQuestions);
    }

    const bonusXP = (!isSkillTree && !isLiveSession && sessionScore === totalQuestions) ? 20 : 0;
    if (bonusXP > 0) {
      addXP(bonusXP);
      const topXpEl = document.querySelector("#top-nav-xp-val");
      if (topXpEl && state.profile) topXpEl.innerText = state.profile.xp;
    }

    // Only fire default sync if no custom onComplete handler will manage progress/streak sync
    if (state.userToken && typeof options.onComplete !== "function") {
      if (state.profile) {
        syncUserProgress(state.userToken, state.profile.xp, state.profile.streakCount, state.profile.lastDailyQuestDate);
      }
      flushMasterySync();
    } else if (state.userToken) {
      flushMasterySync();
    }

    const summaryData = {
      mode,
      sessionScore,
      totalQuestions: totalQuestions === Infinity ? questionIndex : totalQuestions,
      isMastered,
      sessionInitialScores,
      bonusXP
    };

    if (typeof options.onComplete === "function") {
      options.onComplete(summaryData);
      return;
    }

    renderDefaultSummary(summaryData);
  }
