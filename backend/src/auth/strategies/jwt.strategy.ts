import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';

interface JwtPayload {
    sub: string;
    email: string;
    role: string;
    hospitalId: string | null;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        configService: ConfigService,
        private authService: AuthService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('JWT_SECRET', 'hms-dev-secret'),
        });
    }

    async validate(payload: JwtPayload) {
        const user = await this.authService.validateUserById(payload.sub);
        if (!user || !user.isActive) {
            throw new UnauthorizedException('User not found or deactivated');
        }
        // Return the full user with hospitalId for tenant scoping
        return user;
    }
}
