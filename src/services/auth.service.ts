import { getSupabase } from '@/lib/supabase/client';
import { mapSupabaseError } from '@/lib/supabase/errors';
import { signInSchema, signUpSchema, type SignInDto, type SignUpDto } from '@/validations';

export class AuthService {
  private readonly db = getSupabase();

  async signIn(dto: SignInDto) {
    const parsed = signInSchema.parse(dto);
    const { data, error } = await this.db.auth.signInWithPassword(parsed);
    if (error) throw mapSupabaseError(error);
    return data;
  }

  async signUp(dto: SignUpDto) {
    const parsed = signUpSchema.parse(dto);
    const { data, error } = await this.db.auth.signUp({
      email: parsed.email,
      password: parsed.password,
      options: { data: { full_name: parsed.fullName } },
    });
    if (error) throw mapSupabaseError(error);
    return data;
  }

  async signOut() {
    const { error } = await this.db.auth.signOut();
    if (error) throw mapSupabaseError(error);
  }

  async resetPassword(email: string) {
    const redirectTo = `${window.location.origin}/login?reset=1`;
    const { error } = await this.db.auth.resetPasswordForEmail(email, { redirectTo });
    if (error) throw mapSupabaseError(error);
  }

  async getSession() {
    const { data, error } = await this.db.auth.getSession();
    if (error) throw mapSupabaseError(error);
    return data.session;
  }

  async getUser() {
    const { data, error } = await this.db.auth.getUser();
    if (error) throw mapSupabaseError(error);
    return data.user;
  }

  onAuthStateChange(callback: Parameters<typeof this.db.auth.onAuthStateChange>[0]) {
    return this.db.auth.onAuthStateChange(callback);
  }
}

export const authService = new AuthService();
