declare module "web-features/data/features.json" {
  type FeatureEntry = { compat_features?: string[] };
  const value: Record<string, FeatureEntry>;
  export default value;
}
