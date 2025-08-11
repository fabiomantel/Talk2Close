/**
 * Configuration Management Service
 * Manages dynamic scoring configurations and phrase sets
 */

const { prisma } = require('../database/connection');

class ConfigurationService {
  constructor() {
    // Default configuration
    this.defaultConfiguration = {
      name: 'Default Configuration',
      weights: {
        urgency: 0.30,
        budget: 0.25,
        interest: 0.25,
        engagement: 0.20
      },
      phrases: {
        urgency: {
          high: [
            'אני צריך לעבור עד החודש הבא',
            'זה דחוף מאוד',
            'השכירות שלי נגמרת בעוד חודש',
            'האישה דוחפת לקנות',
            'יש לי דדליין',
            'דחוף',
            'צריך מהר',
            'יש לי לחץ זמן',
            'המשפחה דוחפת',
            'זמן קצר',
            'מהר',
            'דחיפות'
          ],
          medium: [
            'אני רוצה לעבור',
            'השכירות נגמרת',
            'אני מחפש',
            'זמן קצר'
          ]
        },
        budget: {
          high: [
            'התקציב שלי הוא',
            'יש לי',
            'משכנתא מאושרת',
            'כסף מזומן',
            'המשכנתא שלי מאושרת',
            'אלף שקל',
            'אלפי שקלים',
            'משכנתא',
            'הון עצמי',
            'תקציב'
          ],
          medium: [
            'אני יכול לשלם',
            'יש לי כסף',
            'תקציב של',
            'עד'
          ]
        },
        interest: {
          high: [
            'זה בדיוק מה שחיפשתי',
            'אני אוהב את המיקום',
            'מתי אפשר לראות את הנכס',
            'מה השטח המדויק',
            'איך נראה הנוף',
            'אני מעוניין',
            'זה נשמע טוב',
            'אני רוצה להמשיך',
            'מה השלב הבא',
            'מתי אפשר לראות',
            'איך נראה',
            'מה השטח',
            'אני אוהב',
            'זה בדיוק'
          ],
          medium: [
            'אני רוצה לראות',
            'מתי אפשר',
            'איך',
            'מה'
          ]
        },
        engagement: {
          high: [
            'תשלח לי פרטים נוספים',
            'אני רוצה לשמוע עוד',
            'תוכל לשלוח לי',
            'אני רוצה לדעת יותר',
            'תוכל להסביר',
            'אני רוצה לשמוע',
            'תשלח לי',
            'אני רוצה לדעת',
            'תוכל לספר לי',
            'אני רוצה לשמוע עוד'
          ],
          medium: [
            'אני רוצה',
            'תוכל',
            'אפשר',
            'איך'
          ]
        }
      }
    };
  }

  /**
   * Get the currently active configuration
   * @returns {Promise<Object>} Active configuration
   */
  async getActiveConfiguration() {
    try {
      const activeConfig = await prisma.scoringConfiguration.findFirst({
        where: { isActive: true }
      });

      if (activeConfig) {
        return {
          success: true,
          configuration: {
            id: activeConfig.id,
            name: activeConfig.name,
            weights: activeConfig.weights,
            phrases: activeConfig.phrases,
            isActive: activeConfig.isActive,
            createdAt: activeConfig.createdAt,
            updatedAt: activeConfig.updatedAt
          }
        };
      } else {
        // Return default configuration if no active config exists
        return {
          success: true,
          configuration: this.defaultConfiguration,
          isDefault: true
        };
      }
    } catch (error) {
      console.error('❌ Failed to get active configuration:', error);
      throw new Error(`Configuration retrieval failed: ${error.message}`);
    }
  }

  /**
   * Create a new configuration
   * @param {Object} configuration - Configuration data
   * @returns {Promise<Object>} Created configuration
   */
  async createConfiguration(configuration) {
    try {
      // Validate configuration
      const validation = this.validateConfiguration(configuration);
      if (!validation.isValid) {
        return {
          success: false,
          error: 'Invalid configuration',
          details: validation.errors
        };
      }

      // If this is the first configuration, make it active
      const existingConfigs = await prisma.scoringConfiguration.count();
      const isActive = existingConfigs === 0 ? true : configuration.isActive || false;

      const newConfig = await prisma.scoringConfiguration.create({
        data: {
          name: configuration.name,
          weights: configuration.weights,
          phrases: configuration.phrases,
          isActive: isActive
        }
      });

      console.log(`✅ Configuration created: ${newConfig.name}`);

      return {
        success: true,
        configuration: {
          id: newConfig.id,
          name: newConfig.name,
          weights: newConfig.weights,
          phrases: newConfig.phrases,
          isActive: newConfig.isActive,
          createdAt: newConfig.createdAt,
          updatedAt: newConfig.updatedAt
        }
      };

    } catch (error) {
      console.error('❌ Failed to create configuration:', error);
      throw new Error(`Configuration creation failed: ${error.message}`);
    }
  }

  /**
   * Update an existing configuration
   * @param {number} id - Configuration ID
   * @param {Object} updates - Configuration updates
   * @returns {Promise<Object>} Updated configuration
   */
  async updateConfiguration(id, updates) {
    try {
      // Validate updates
      const validation = this.validateConfiguration(updates, true);
      if (!validation.isValid) {
        return {
          success: false,
          error: 'Invalid configuration updates',
          details: validation.errors
        };
      }

      // If making this configuration active, deactivate others
      if (updates.isActive) {
        await prisma.scoringConfiguration.updateMany({
          where: { isActive: true },
          data: { isActive: false }
        });
      }

      const updatedConfig = await prisma.scoringConfiguration.update({
        where: { id: parseInt(id) },
        data: {
          name: updates.name,
          weights: updates.weights,
          phrases: updates.phrases,
          isActive: updates.isActive,
          updatedAt: new Date()
        }
      });

      console.log(`✅ Configuration updated: ${updatedConfig.name}`);

      return {
        success: true,
        configuration: {
          id: updatedConfig.id,
          name: updatedConfig.name,
          weights: updatedConfig.weights,
          phrases: updatedConfig.phrases,
          isActive: updatedConfig.isActive,
          createdAt: updatedConfig.createdAt,
          updatedAt: updatedConfig.updatedAt
        }
      };

    } catch (error) {
      console.error('❌ Failed to update configuration:', error);
      throw new Error(`Configuration update failed: ${error.message}`);
    }
  }

  /**
   * Delete a configuration
   * @param {number} id - Configuration ID
   * @returns {Promise<Object>} Deletion result
   */
  async deleteConfiguration(id) {
    try {
      const config = await prisma.scoringConfiguration.findUnique({
        where: { id: parseInt(id) }
      });

      if (!config) {
        return {
          success: false,
          error: 'Configuration not found'
        };
      }

      // Don't allow deletion of active configuration
      if (config.isActive) {
        return {
          success: false,
          error: 'Cannot delete active configuration. Please activate another configuration first.'
        };
      }

      await prisma.scoringConfiguration.delete({
        where: { id: parseInt(id) }
      });

      console.log(`✅ Configuration deleted: ${config.name}`);

      return {
        success: true,
        message: 'Configuration deleted successfully'
      };

    } catch (error) {
      console.error('❌ Failed to delete configuration:', error);
      throw new Error(`Configuration deletion failed: ${error.message}`);
    }
  }

  /**
   * List all configurations
   * @returns {Promise<Object>} List of configurations
   */
  async listConfigurations() {
    try {
      const configs = await prisma.scoringConfiguration.findMany({
        orderBy: { createdAt: 'desc' }
      });

      return {
        success: true,
        configurations: configs.map(config => ({
          id: config.id,
          name: config.name,
          weights: config.weights,
          phrases: config.phrases,
          isActive: config.isActive,
          createdAt: config.createdAt,
          updatedAt: config.updatedAt
        }))
      };

    } catch (error) {
      console.error('❌ Failed to list configurations:', error);
      throw new Error(`Configuration listing failed: ${error.message}`);
    }
  }

  /**
   * Activate a configuration
   * @param {number} id - Configuration ID
   * @returns {Promise<Object>} Activation result
   */
  async activateConfiguration(id) {
    try {
      // Deactivate all configurations
      await prisma.scoringConfiguration.updateMany({
        data: { isActive: false }
      });

      // Activate the specified configuration
      const activatedConfig = await prisma.scoringConfiguration.update({
        where: { id: parseInt(id) },
        data: { isActive: true }
      });

      console.log(`✅ Configuration activated: ${activatedConfig.name}`);

      return {
        success: true,
        configuration: {
          id: activatedConfig.id,
          name: activatedConfig.name,
          weights: activatedConfig.weights,
          phrases: activatedConfig.phrases,
          isActive: activatedConfig.isActive,
          createdAt: activatedConfig.createdAt,
          updatedAt: activatedConfig.updatedAt
        }
      };

    } catch (error) {
      console.error('❌ Failed to activate configuration:', error);
      throw new Error(`Configuration activation failed: ${error.message}`);
    }
  }

  /**
   * Validate configuration data
   * @param {Object} configuration - Configuration to validate
   * @param {boolean} isUpdate - Whether this is an update operation
   * @returns {Object} Validation result
   */
  validateConfiguration(configuration, isUpdate = false) {
    const errors = [];

    // Validate required fields
    if (!isUpdate || configuration.name !== undefined) {
      if (!configuration.name || configuration.name.trim().length === 0) {
        errors.push('Configuration name is required');
      }
    }

    // Validate weights
    if (!isUpdate || configuration.weights !== undefined) {
      if (!configuration.weights) {
        errors.push('Weights are required');
      } else {
        const requiredWeights = ['urgency', 'budget', 'interest', 'engagement'];
        const weightSum = requiredWeights.reduce((sum, weight) => {
          if (!configuration.weights[weight] || typeof configuration.weights[weight] !== 'number') {
            errors.push(`Weight for ${weight} is required and must be a number`);
            return sum;
          }
          return sum + configuration.weights[weight];
        }, 0);

        if (Math.abs(weightSum - 1.0) > 0.01) {
          errors.push('Weights must sum to 1.0');
        }
      }
    }

    // Validate phrases
    if (!isUpdate || configuration.phrases !== undefined) {
      if (!configuration.phrases) {
        errors.push('Phrases are required');
      } else {
        const requiredCategories = ['urgency', 'budget', 'interest', 'engagement'];
        requiredCategories.forEach(category => {
          if (!configuration.phrases[category]) {
            errors.push(`Phrases for ${category} are required`);
          } else {
            if (!configuration.phrases[category].high || !Array.isArray(configuration.phrases[category].high)) {
              errors.push(`High phrases for ${category} must be an array`);
            }
            if (!configuration.phrases[category].medium || !Array.isArray(configuration.phrases[category].medium)) {
              errors.push(`Medium phrases for ${category} must be an array`);
            }
          }
        });
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Get default configuration
   * @returns {Object} Default configuration
   */
  getDefaultConfiguration() {
    return this.defaultConfiguration;
  }

  /**
   * Reset to default configuration
   * @returns {Promise<Object>} Reset result
   */
  async resetToDefault() {
    try {
      // Deactivate all existing configurations
      await prisma.scoringConfiguration.updateMany({
        data: { isActive: false }
      });

      // Create default configuration as active
      const defaultConfig = await this.createConfiguration({
        ...this.defaultConfiguration,
        isActive: true
      });

      return {
        success: true,
        message: 'Reset to default configuration',
        configuration: defaultConfig.configuration
      };

    } catch (error) {
      console.error('❌ Failed to reset to default configuration:', error);
      throw new Error(`Reset to default failed: ${error.message}`);
    }
  }

  /**
   * Export configuration
   * @param {number} id - Configuration ID
   * @returns {Promise<Object>} Exported configuration
   */
  async exportConfiguration(id) {
    try {
      const config = await prisma.scoringConfiguration.findUnique({
        where: { id: parseInt(id) }
      });

      if (!config) {
        return {
          success: false,
          error: 'Configuration not found'
        };
      }

      return {
        success: true,
        configuration: {
          name: config.name,
          weights: config.weights,
          phrases: config.phrases,
          exportedAt: new Date().toISOString()
        }
      };

    } catch (error) {
      console.error('❌ Failed to export configuration:', error);
      throw new Error(`Configuration export failed: ${error.message}`);
    }
  }

  /**
   * Import configuration
   * @param {Object} configuration - Configuration to import
   * @returns {Promise<Object>} Import result
   */
  async importConfiguration(configuration) {
    try {
      // Validate imported configuration
      const validation = this.validateConfiguration(configuration);
      if (!validation.isValid) {
        return {
          success: false,
          error: 'Invalid imported configuration',
          details: validation.errors
        };
      }

      // Create imported configuration
      const importedConfig = await this.createConfiguration({
        name: `${configuration.name} (Imported)`,
        weights: configuration.weights,
        phrases: configuration.phrases,
        isActive: false
      });

      return {
        success: true,
        message: 'Configuration imported successfully',
        configuration: importedConfig.configuration
      };

    } catch (error) {
      console.error('❌ Failed to import configuration:', error);
      throw new Error(`Configuration import failed: ${error.message}`);
    }
  }
}

module.exports = new ConfigurationService();
