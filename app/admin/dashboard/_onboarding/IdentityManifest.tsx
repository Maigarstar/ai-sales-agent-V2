const handleFinalSync = async () => {
  if (!userId) {
    alert("No active session found. Please log in again.");
    return;
  }
    
  setLoading(true);
  console.log("Starting Sync for User:", userId);

  try {
    const { error } = await supabase
      .from("profiles")
      .update({
        business_name: formData.business_name,
        category: formData.category,
        luxury_tier: formData.luxury_tier,
        starting_price: parseInt(formData.investment_floor),
        onboarding_completed: true, // Crucial for redirect logic
      })
      .eq("id", userId);

    if (error) {
      console.error("Supabase Error:", error.message);
      alert(`Sync Failed: ${error.message}`);
      throw error;
    }

    console.log("Sync Successful. Redirecting...");
    router.push("/dashboard/overview");
    router.refresh(); 
  } catch (err) {
    console.error("Critical Sync Failure:", err);
  } finally {
    setLoading(false);
  }
};
