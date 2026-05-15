import { afterEach } from "vitest";
import { prisma } from "../lib/prisma";

/**
 * Cleanup automático após cada teste
 * Remove todos os dados para garantir testes independentes
 */
export function setupTestDatabase() {
	afterEach(async () => {
		try {
			// Ordem importa: deletar com dependências primeiro
			await prisma.like.deleteMany();
			await prisma.comment.deleteMany();
			await prisma.subscription.deleteMany();
			await prisma.video.deleteMany();
			await prisma.user.deleteMany();
		} catch (error) {
			console.error("Cleanup failed:", error);
		}
	});
}

/**
 * Limpar manualmente um documento
 */
export async function cleanupUser(userId: string) {
	await prisma.like.deleteMany({ where: { userId } });
	await prisma.comment.deleteMany({ where: { authorId: userId } });
	await prisma.video.deleteMany({ where: { userId } });
	await prisma.subscription.deleteMany({
		where: {
			OR: [{ subscriberId: userId }, { subscribedToId: userId }],
		},
	});
	await prisma.user.delete({ where: { id: userId } });
}

/**
 * Limpar video e dados relacionados
 */
export async function cleanupVideo(videoId: string) {
	await prisma.like.deleteMany({ where: { videoId } });
	await prisma.comment.deleteMany({ where: { videoId } });
	await prisma.video.delete({ where: { id: videoId } });
}
