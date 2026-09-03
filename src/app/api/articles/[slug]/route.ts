import { NextRequest, NextResponse } from 'next/server';
import { getArticleBySlug, updateArticle, deleteArticle } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const slug = params.slug;
    const article = await getArticleBySlug(slug);

    if (!article) {
      return NextResponse.json({ success: false, error: 'Article introuvable.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, article });
  } catch (error: any) {
    console.error('Error fetching single article:', error);
    return NextResponse.json({ success: false, error: 'Erreur lors du chargement de l\'article.' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const slug = params.slug;
    const body = await request.json();

    const existing = await getArticleBySlug(slug);
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Article introuvable.' }, { status: 404 });
    }

    const updated = await updateArticle(existing.id, body);

    return NextResponse.json({ success: true, article: updated });
  } catch (error: any) {
    console.error('Error updating article:', error);
    return NextResponse.json({ success: false, error: 'Erreur lors de la mise à jour de l\'article.' }, { status: 500 });
  }
}

export const PATCH = PUT;

export async function DELETE(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const slug = params.slug;
    const existing = await getArticleBySlug(slug);

    if (!existing) {
      return NextResponse.json({ success: false, error: 'Article introuvable.' }, { status: 404 });
    }

    await deleteArticle(existing.id);

    return NextResponse.json({ success: true, message: 'Article supprimé avec succès.' });
  } catch (error: any) {
    console.error('Error deleting article:', error);
    return NextResponse.json({ success: false, error: 'Erreur lors de la suppression de l\'article.' }, { status: 500 });
  }
}
