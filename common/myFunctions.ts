//myFunctions.ts

export function NzInt(value: string | null | undefined, defValue = 0) {
  try {
    if (value !== null && value !== undefined && value !== "")
      return parseInt(value);
  } catch (err) {}
  return defValue;
}

//todo convert function filterByHeader to typescript
export function filterByHeader(record: any, headerFilter: any) {
  for (let propertyName in headerFilter) {
    const hf = headerFilter[propertyName];
    if (!hf && hf !== 0) return true;
    if (hf !== -1) {
      if (propertyName in record && record[propertyName] !== hf) return false;
    }
  }
  return true;
}

type EnumType = { [key in number]: string };
// type ValueOf<T> = T[keyof T];
// type EnumItems<T> = Array<T>;
function GetEnumList<TEnum>(item: EnumType & TEnum): Array<string | number> {
  return (
    // get enum keys and values
    Object.values(item)
    // Half of enum items are keys and half are values so we need to filter by index
    //.filter((e, index, array) => index < ( array.length / 2 ))
  );
}

export function GetEnumFromString<TEnum>(
  item: EnumType & TEnum,
  eString: string
): number {
  const conv = GetEnumList(item);
  return conv[conv.length / 2 + conv.indexOf(eString)] as number;
}
