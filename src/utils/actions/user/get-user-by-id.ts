import { prisma } from "@/lib/prisma";

export const getUserById = async (id: string) => {
	const user = await prisma.user.findUnique({
		where: { id },
		select: {
			id: true,
			name: true,
			avatarUrl: true,
			age: true,
			email: true,
			role: true,
			username: true,
			createdAt: true,
			subscribers: true,
		},
	});

	if (!user) {
		return null;
	}

	return {
		...user,
		subscribersCount: user.subscribers.length,
	};
};
