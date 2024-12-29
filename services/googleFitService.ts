import GoogleFit, { BucketUnit, Scopes } from 'react-native-google-fit';

export interface DailyStats {
  bmr: number;
  activeCalories: number;
  totalCalories: number;
  steps: number;
  distance: number;
}

export const googleFitService = {
  async initialize(): Promise<void> {
    try {
      const options = {
        scopes: [
          Scopes.FITNESS_ACTIVITY_READ,
          Scopes.FITNESS_BODY_READ,
          Scopes.FITNESS_LOCATION_READ,
        ],
      };
      await GoogleFit.checkIsAuthorized();
    } catch (error) {
      console.error('Error initializing Google Fit:', error);
      throw error;
    }
  },

  async authorize(): Promise<boolean> {
    try {
      const options = {
        scopes: [
          Scopes.FITNESS_ACTIVITY_READ,
          Scopes.FITNESS_BODY_READ,
          Scopes.FITNESS_LOCATION_READ,
        ],
      };

      await this.initialize();
      const authResult = await GoogleFit.authorize(options);
      return authResult.success;
    } catch (error) {
      console.error('Error authorizing Google Fit:', error);
      throw error;
    }
  },

  async checkIsAuthorized(): Promise<boolean> {
    try {
      await this.initialize();
      const authResult = await GoogleFit.isAuthorized;
      return !!authResult;
    } catch (error) {
      console.error('Error checking Google Fit authorization:', error);
      throw error;
    }
  },

  async disconnect(): Promise<void> {
    try {
      await GoogleFit.disconnect();
    } catch (error) {
      console.error('Error disconnecting from Google Fit:', error);
      throw error;
    }
  },

  async getDailyStats(date: Date = new Date()): Promise<DailyStats> {
    try {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);

      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);

      // Get BMR (Basal Metabolic Rate)
      const bmr = await GoogleFit.getDailyCalorieSamples({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        basalCalculation: true,
      });

      // Get Active Calories
      const activeCalories = await GoogleFit.getDailyCalorieSamples({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        basalCalculation: false,
      });

      // Get Steps
      const steps = await GoogleFit.getDailyStepCountSamples({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        bucketUnit: BucketUnit.DAY,
        bucketInterval: 1,
      });

      // Get Distance
      const distance = await GoogleFit.getDailyDistanceSamples({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        bucketUnit: BucketUnit.DAY,
        bucketInterval: 1,
      });

      // Calculate total calories (BMR + Active)
      const bmrValue = bmr.length > 0 ? bmr[0].calorie : 0;
      const activeValue = activeCalories.length > 0 ? activeCalories[0].calorie : 0;
      const stepsValue = this.extractStepsValue(steps);
      const distanceValue = distance.length > 0 ? distance[0].distance : 0;

      return {
        bmr: Math.round(bmrValue),
        activeCalories: Math.round(activeValue),
        totalCalories: Math.round(bmrValue + activeValue),
        steps: stepsValue,
        distance: Math.round(distanceValue),
      };
    } catch (error) {
      console.error('Error getting daily stats from Google Fit:', error);
      throw error;
    }
  },

  extractStepsValue(stepsData: any[]): number {
    try {
      // Find the steps data source that has data
      const validSource = stepsData.find(source =>
        source.steps && source.steps.length > 0
      );

      if (validSource && validSource.steps[0].value) {
        return validSource.steps[0].value;
      }

      return 0;
    } catch (error) {
      console.error('Error extracting steps value:', error);
      return 0;
    }
  },
};
