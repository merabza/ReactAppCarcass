//passwordRules.ts

import * as yup from "yup";

//კლიენტის მხარეს მხოლოდ მინიშნებაა: სრული წესები (მომხმარებლის სახელი, გავრცელებული პაროლები) სერვერზე მოწმდება
export const passwordRulesHint =
    "მინიმუმ 12 სიმბოლო, მათ შორის მინიმუმ ერთი ასო და ერთი ციფრი. არ უნდა შეიცავდეს მომხმარებლის სახელს, ან ელფოსტას";

export const passwordMinLength = 12;

export function passwordSchema(requiredMessage: string = "პაროლი შევსებული უნდა იყოს") {
    return yup
        .string()
        .required(requiredMessage)
        .min(passwordMinLength, `პაროლი უნდა შედგებოდეს მინიმუმ ${passwordMinLength} სიმბოლოსგან`)
        .matches(/[0-9]/, "პაროლი უნდა შეიცავდეს მინიმუმ ერთ ციფრს")
        .matches(/\p{L}/u, "პაროლი უნდა შეიცავდეს მინიმუმ ერთ ასოს");
}

export const codeSchema = yup
    .string()
    .required("კოდი შევსებული უნდა იყოს")
    .matches(/^[0-9]{6}$/, "კოდი 6 ციფრისგან უნდა შედგებოდეს");
