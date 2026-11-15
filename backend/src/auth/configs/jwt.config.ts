import { registerAs } from '@nestjs/config';

export default registerAs('Jwt', () => ({
  secret: process.env.JWT_SECRET,
  ttl: parseInt(process.env.JWT_TTL ?? '3000', 10),
}));
