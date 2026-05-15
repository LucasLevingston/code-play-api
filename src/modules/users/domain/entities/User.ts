export interface UserProps {
   id: string;
   name: string;
   email: string;
   password: string;
   age: number;
   role: "USER" | "ADMIN";
   username: string;
   avatarUrl?: string | null;
   createdAt: Date;
}

export default function createUserEntity(props: UserProps) {
   if (!props.name || props.name.length < 2) {
      throw new Error("Name must have at least 2 characters");
   }
   if (props.age < 0) {
      throw new Error("Age must be a positive number");
   }
   if (props.username.length < 3) {
      throw new Error("Username must have at least 3 characters");
   }

   return {
      id: props.id,
      name: props.name,
      email: props.email,
      password: props.password,
      age: props.age,
      role: props.role,
      username: props.username,
      avatarUrl: props.avatarUrl || null,
      createdAt: props.createdAt,
   };
}
