import { User } from "lucide-react";

const ProfileView = () => {
  return (
    <div className="flex flex-col items-center justify-center py-16 space-y-4">
      <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center">
        <User className="w-10 h-10 text-muted-foreground" />
      </div>
      <h2 className="text-lg font-semibold text-foreground">Profil Pengguna</h2>
      <p className="text-sm text-muted-foreground text-center px-8">
        Halaman profil akan ditampilkan di sini.
      </p>
    </div>
  );
};

export default ProfileView;
