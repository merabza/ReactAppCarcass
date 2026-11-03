//authenticationTypes.ts

//რა უნდა გააკეთოს მომხმარებელმა ავტორიზაციის დასასრულებლად (სერვერის ELoginNextStep)
export type LoginNextStep =
    | "None"
    | "ConfirmEmail"
    | "ChangePassword"
    | "EmailConfirmedLoginRequired";

export interface IAppUser {
    userName: string;
    email: string;
    userId: number;
    sequentialNumber: number;
    token: string;
    firstName: string;
    lastName: string;
    roleName: string;
    appClaims: string[];
    nextStep?: LoginNextStep;
    //წვდომის ტოკენის განახლების ტოკენი. ივსება მხოლოდ სრული ავტორიზაციისას (nextStep === "None")
    refreshToken?: string | null;
}

//დაუსრულებელი ავტორიზაცია: სერვერმა დროებითი ტოკენი დააბრუნა და ელოდება ელფოსტის დადასტურებას, ან პაროლის ცვლილებას
export interface IPendingLogin {
    token: string;
    nextStep: LoginNextStep;
    userId: number;
    userName: string;
    email: string;
    //სჭირდება თუ არა პაროლის ცვლილების ნაბიჯს ელფოსტაზე გაგზავნილი კოდი
    codeRequired: boolean;
}

//JWT-ს payload-ის წაკითხვა ხელმოწერის შემოწმების გარეშე (მხოლოდ UI-ს გადაწყვეტილებებისთვის)
export function decodeJwtPayload(token: string): Record<string, unknown> {
    try {
        const payload = token.split(".")[1];
        if (!payload) return {};
        const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
        const json = decodeURIComponent(
            Array.from(atob(base64), (c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0")).join("")
        );
        return JSON.parse(json) as Record<string, unknown>;
    } catch {
        return {};
    }
}

export function toPendingLogin(response: IAppUser): IPendingLogin {
    const payload = decodeJwtPayload(response.token);
    return {
        token: response.token,
        nextStep: response.nextStep ?? "None",
        userId: response.userId,
        userName: response.userName,
        email: response.email,
        codeRequired: payload["carcass_code_required"] === "1",
    };
}

export function pendingStepPath(nextStep: LoginNextStep): string {
    switch (nextStep) {
        case "ConfirmEmail":
            return "/confirm-email";
        case "ChangePassword":
            return "/change-required-password";
        default:
            return "/login";
    }
}
