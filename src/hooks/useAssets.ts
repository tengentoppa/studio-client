import { createContext, createElement, useContext, useEffect, useState } from 'react';

export interface IAssetsContext {
  assets: Record<string, string>;
}

type AssetsProvderProps = React.PropsWithChildren<{ assetsCtx?: __WebpackModuleApi.RequireContext }>;

const Context = createContext<IAssetsContext | null>(null);

export function useAssets(this: any) {
  const context = useContext(Context);
  if (context === null) {
    throw new Error(`${this.name} must be used within a ${AssetsProvider.name}`);
  }
  return context;
}

export function AssetsProvider({ children, assetsCtx: ctx }: AssetsProvderProps) {
  const [loading, setLoading] = useState(false);
  const [assets, setAssets] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!ctx) return;

    const preload = async () => {
      const assets: Record<string, string> = {};
      await Promise.all(
        ctx.keys().map(async k => {
          const path = ctx(k);
          await fetch(path);
          assets[k.replace(/^\.\//, '')] = path;
        })
      );
      setAssets(assets);
      setLoading(false);
    };

    setLoading(true);
    preload();
  }, [ctx]);

  if (loading) {
    return null;
  }

  return createElement(Context.Provider, { value: { assets } }, children);
}