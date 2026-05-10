import { faker } from "@faker-js/faker/locale/pt_BR";
import { hashPassword } from "@/utils/jwt";
import { Role } from "../../../generated/prisma";
import { prisma } from "../prisma";

interface MakeUserProps {
	password?: string;
	email?: string;
	role?: Role;
	name?: string;
	username?: string;
	avatarUrl?: string | null;
	age?: number;

	historyIds?: string[];
	likedVideoIds?: string[];
	likedCommentIds?: string[];
	watchLaterIds?: string[];

	[key: string]: any;
}

export const makeUser = async ({
	password,
	email,
	role = Role.USER,
	...data
}: MakeUserProps = {}) => {
	const passwordBeforeHash = password ?? "123456";

	const hashedPassword = await hashPassword(passwordBeforeHash);

	const user = await prisma.user.create({
		data: {
			name: data.name ?? faker.person.fullName(),

			username: data.username ?? faker.internet.username().toLowerCase(),

			email: email ?? faker.internet.email(),

			password: hashedPassword,

			age:
				data.age ??
				faker.number.int({
					min: 18,
					max: 55,
				}),

			role,

			avatarUrl: data.avatarUrl ?? faker.image.avatar(),

			createdAt: data.createdAt ?? faker.date.past(),

			historyIds: data.historyIds ?? [],

			likedVideoIds: data.likedVideoIds ?? [],

			likedCommentIds: data.likedCommentIds ?? [],

			watchLaterIds: data.watchLaterIds ?? [],

			...data,
		},
	});

	return {
		user,
		passwordBeforeHash,
	};
};
