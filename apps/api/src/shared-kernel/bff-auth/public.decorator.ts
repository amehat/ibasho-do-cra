import { SetMetadata } from "@nestjs/common";

// Marque un contrôleur/route comme public (exempt de la garde globale BFF). Default-deny (AD-14).
export const IS_PUBLIC_KEY = "isPublic";
export const Public = (): MethodDecorator & ClassDecorator => SetMetadata(IS_PUBLIC_KEY, true);
