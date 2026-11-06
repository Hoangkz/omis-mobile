import { useState } from "react";

export const useToggle = (initialValue: boolean = false): [boolean, () => void, (value: boolean) => void] => {
    const [value, setValue] = useState<boolean>(initialValue);
    const toggleValue = () => setValue((prev) => !prev);
    const setToggleValue = (newValue: boolean) => setValue(newValue);
    return [value, toggleValue, setToggleValue];
}