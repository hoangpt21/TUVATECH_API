import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { env } from '../config/environment';
import { API_WEBSITE } from '../utils/constants';
import { userService } from '../services/userService';
passport.serializeUser((user, done) => {
  done(null, user.user_id); // lưu user.id vào session
});

passport.deserializeUser(async (id, done) => {
  const user = await userService.list_an_user(id);
  done(null, user);
});

const handleLoginWithGoogle = () => {
    passport.use(new GoogleStrategy({
        clientID:     env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
        callbackURL: `${API_WEBSITE}/v1/users/google/login`,
      },
      async function(accessToken, refreshToken, profile, cb) {
        const newUser = {
          display_name: profile?.displayName,
          email: profile?.emails[0]?.value,
          password: profile?.id
        }
        let user = await userService.upsert_user(newUser);
        return cb(null, user);
      }
    ));
}

export const GoogleLoginProvider = {
    handleLoginWithGoogle
}