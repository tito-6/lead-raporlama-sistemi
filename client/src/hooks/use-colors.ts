// React hook for using the color management system
import { useState, useEffect } from "react";
import { colorManager, ColorSettings } from "../lib/color-store";

export function useColors() {
  const [colors, setColors] = useState<ColorSettings>(
    colorManager.getAllColors()
  );

  useEffect(() => {
    const unsubscribe = colorManager.subscribe(() => {
      setColors(colorManager.getAllColors());
    });

    // Automatically populate colors from API data when hook is first used
    colorManager.populateFromAPIData();

    return unsubscribe;
  }, []);

  return {
    colors,
    getColor: colorManager.getColor.bind(colorManager),
    updateColor: colorManager.updateColor.bind(colorManager),
    updateCategory: colorManager.updateCategory.bind(colorManager),
    resetToDefaults: colorManager.resetToDefaults.bind(colorManager),
    exportColors: colorManager.exportColors.bind(colorManager),
    importColors: colorManager.importColors.bind(colorManager),
    getCategoryColors: colorManager.getCategoryColors.bind(colorManager),
    populateFromAPIData: colorManager.populateFromAPIData.bind(colorManager),
  };
}
