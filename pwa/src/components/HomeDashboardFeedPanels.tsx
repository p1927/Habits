import { HomeCalorieTrendCard } from './HomeCalorieTrendCard';
import { HomeDecisionCard } from './HomeDecisionCard';
import { HomeHabitTrendCard } from './HomeHabitTrendCard';
import { HomeMealPhotosPanel } from './HomeMealPhotosPanel';
import { HomeSavedRecipeCard } from './HomeSavedRecipeCard';
import type { HomeDashboardFeedProps } from '../lib/homeDashboardPanelsTypes';

export function HomeDashboardFeedPanels({
  serverOnline,
  onOpenLogHistory,
  onOpenLogRecipes,
  onOpenFutureSelf,
  setFood,
  setError,
  recipeLogging,
  logItem,
  logEntireRecipe,
  recipeMessage,
  mealPhotos,
  history,
  habitWeek,
  decisionCard,
  setDecisionCard,
  handleAcceptCard,
}: HomeDashboardFeedProps) {
  return (
    <>
      <HomeSavedRecipeCard
        serverOnline={serverOnline}
        onFoodUpdated={setFood}
        onError={setError}
        logging={recipeLogging}
        onLogItem={(foodName, quantityG) => logItem(foodName, quantityG)}
        onLogEntireRecipe={() => void logEntireRecipe()}
        onOpenLogRecipes={onOpenLogRecipes}
      />
      {recipeMessage && (
        <p className="banner banner-ok banner-revolut" role="status">
          {recipeMessage}
        </p>
      )}

      <HomeMealPhotosPanel photos={mealPhotos} />

      <HomeCalorieTrendCard days={history} onOpenHistory={onOpenLogHistory} />

      <HomeHabitTrendCard habitWeek={habitWeek} />

      {decisionCard && (
        <HomeDecisionCard
          card={decisionCard}
          onOpenFutureSelf={onOpenFutureSelf}
          onSwipe={(dir) => {
            if (dir === 'right') void handleAcceptCard();
            else if (dir === 'left' || dir === 'up') setDecisionCard(null);
          }}
        />
      )}
    </>
  );
}
