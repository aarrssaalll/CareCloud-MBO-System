export async function GET() {
  try {
    // Get default weightage from system settings
    // Default Objective Weight setting is ID "2" with default value 20
    const settings = localStorage.getItem("systemSettings");
    
    let defaultWeightage = 20; // fallback default
    
    if (settings) {
      try {
        const parsedSettings = JSON.parse(settings);
        const weightSetting = parsedSettings.find((s: any) => s.id === "2");
        if (weightSetting && weightSetting.value) {
          defaultWeightage = parseInt(weightSetting.value);
        }
      } catch (e) {
        console.error("Error parsing system settings:", e);
      }
    }
    
    return Response.json({
      success: true,
      defaultWeightage: defaultWeightage,
      message: `Default objective weight is ${defaultWeightage}%`
    });
  } catch (error) {
    console.error("❌ Error fetching default weightage:", error);
    return Response.json({
      success: false,
      error: "Failed to fetch default weightage",
      defaultWeightage: 20 // fallback
    }, { status: 500 });
  }
}
