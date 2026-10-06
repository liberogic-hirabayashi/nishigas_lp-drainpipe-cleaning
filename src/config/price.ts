/**
 * 料金定義。価格改定時はここだけ変更すれば全ページに反映される
 *
 * @example
 * import { basicPackPrice } from '@/config/price';
 * <span>{basicPackPrice}</span>円（税込） // => 38,500円（税込）
 */

/** 基本パック（税込・円） */
const BASIC_PACK_PRICE = 38500;

export const basicPackPrice = BASIC_PACK_PRICE.toLocaleString('ja-JP');
