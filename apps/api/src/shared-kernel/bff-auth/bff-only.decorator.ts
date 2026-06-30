import { SetMetadata } from "@nestjs/common";

// Route pré-auth : exige un jeton BFF signé valide (ORIGINE) mais PAS de userId (AD-14).
// Ex. /auth/register, /auth/login, /auth/session — l'utilisateur n'est pas encore authentifié.
export const IS_BFF_ONLY_KEY = "isBffOnly";
export const BffOnly = (): MethodDecorator & ClassDecorator => SetMetadata(IS_BFF_ONLY_KEY, true);
