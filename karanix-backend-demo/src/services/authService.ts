import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/User';
import { config } from '../config';
import { unauthorized } from '../utils/httpErrors';

interface LoginResult {
  token: string;
  user: Pick<IUser, 'id' | 'name' | 'email' | 'role'>;
}

export const login = async (email: string, password: string): Promise<LoginResult> => {
  const user = await User.findOne({ email }).exec();
  const valid = user && (await bcrypt.compare(password, user.password));
  if (!valid || !user) {
    throw unauthorized('Invalid credentials');
  }

  const secret = config.jwtSecret as jwt.Secret;
  const expiresIn = config.jwtExpiry as jwt.SignOptions['expiresIn'];

  const token = jwt.sign(
    {
      userId: user.id,
      role: user.role
    },
    secret,
    { expiresIn }
  );

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  };
};

export const hashPassword = (password: string) => bcrypt.hash(password, 10);
