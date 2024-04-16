const app_name = "memorymap.xyz";

export function buildPath(route) {
  if (process.env.NODE_ENV === "production") {
    return "https://" + app_name + route;
  } else {
    return "http://localhost:5001/" + route;
  }
}
