import type { Currency } from '@dinero.js/currencies';
import type { RoundingMode } from '@dinero.js/calculator';
import type { Dinero, Rates } from '../types';
import type { Dependencies } from './types';

export type ConvertParams<TAmount> = readonly [
  dineroObject: Dinero<TAmount>,
  newCurrency: Currency<TAmount>,
  options: ConvertOptions<TAmount>
];

export type ConvertOptions<TAmount> = {
  readonly rates: Readonly<Promise<Rates<TAmount>>>;
  readonly round: RoundingMode;
  readonly preserveScale?: boolean;
};

export type ConvertDependencies<TAmount> = Dependencies<
  TAmount,
  'multiply' | 'round'
>;

export function convert<TAmount>({ calculator }: ConvertDependencies<TAmount>) {
  return async function convertFn(
    ...[
      dineroObject,
      newCurrency,
      { rates, round = calculator.round, preserveScale = true },
    ]: ConvertParams<TAmount>
  ) {
    const r = await rates;
    const rate = r[newCurrency.code];

    const { amount, scale: sourceScale } = dineroObject.toJSON();

    return dineroObject.create({
      amount: round(calculator.multiply(amount, rate)),
      currency: newCurrency,
      scale: preserveScale ? sourceScale : newCurrency.exponent,
    });
  };
}
