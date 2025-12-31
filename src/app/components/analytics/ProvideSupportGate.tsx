export function loadProvideSupportTracker() {
  if (document.getElementById("providesupport-tracker")) return;

  const script = document.createElement("script");
  script.id = "providesupport-tracker";
  script.async = true;
  script.src =
    "https://image.providesupport.com/js/00w8xxhihpcie1ionxhh6o20ab/safe-monitor-sync.js?ps_h=kOig&ps_t=" +
    Date.now();

  document.body.appendChild(script);
}
