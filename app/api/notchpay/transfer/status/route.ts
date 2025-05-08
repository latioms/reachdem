import { NextRequest, NextResponse } from 'next/server';

/**
 * API pour vérifier le statut d'un transfert via NotchPay
 * Endpoint: GET /api/notchpay/transfer/status
 * Query params: reference (obligatoire) - La référence du transfert à vérifier
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const reference = searchParams.get('reference');

  if (!reference) {
    return NextResponse.json({ error: 'La référence du transfert est requise' }, { status: 400 });
  }

  const publicKey = process.env.NOTCHPAY_PUBLIC_KEY;
  const privateKey = process.env.NOTCHPAY_PRIVATE_KEY;

  if (!publicKey || !privateKey) {
    console.error('Les clés API NotchPay ne sont pas configurées dans les variables d\'environnement.');
    return NextResponse.json({ error: 'Erreur de configuration du serveur' }, { status: 500 });
  }

  const notchPayUrl = `https://api.notchpay.co/transfers/${reference}`;

  try {
    console.log(`[API Transfer Status] Vérification du statut pour la référence de transfert: ${reference}`);
    const response = await fetch(notchPayUrl, {
      method: 'GET',
      headers: {
        'Authorization': publicKey,
        'X-Grant': privateKey,
        'Accept': 'application/json',
        'Cache-Control': 'no-cache',
      },
      cache: 'no-store',
    });

    const data = await response.json();
    console.log(`[API Transfer Status] Réponse NotchPay pour ${reference}:`, data);

    if (!response.ok) {
      console.error(`[API Transfer Status] Erreur API NotchPay pour ${reference} (${response.status}):`, data);
      return NextResponse.json({ 
        error: data.message || `Échec de la récupération du statut du transfert (${response.status})`, 
        details: data 
      }, { status: response.status });
    }

    
    // Extraire le statut du transfert, qui peut être dans différents emplacements selon l'API
    const transferStatus = data.transfer?.status || data.status || 'pending';
    
    // Retourner une structure cohérente que le client peut toujours traiter de la même façon
    return NextResponse.json({
      status: data.status || 'success',        // Statut global de la requête
      message: data.message || 'Statut récupéré avec succès',
      code: data.code || response.status,
      transfer: {
        ...(data.transfer || {}),              // Inclure les détails du transfert s'ils existent
        status: transferStatus,                // S'assurer que le statut est toujours présent
        reference: data.transfer?.reference || reference
      }
    });

  } catch (error) {
    console.error(`[API Transfer Status] Erreur lors de la vérification du statut pour ${reference}:`, error);
    return NextResponse.json({ 
      error: 'Échec de la récupération du statut du transfert', 
      details: error instanceof Error ? error.message : String(error) 
    }, { status: 500 });
  }
}