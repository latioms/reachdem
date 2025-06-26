import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // Extraire les données du body
    const { amount, description, phone } = await request.json();

    const payload = {
        amount ,
        description,
        phone,
    };

    // Valider les données (double validation pour plus de sécurité)
    // Appel à l'API externe
    const response = await fetch('https://payout.latioms.co/api/transfer', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Ajoutez d'autres en-têtes si nécessaires (Autorisation, etc.)
      },
      body: JSON.stringify(payload),
    });

    // Lire le corps de la réponse en texte pour éviter les erreurs de parsing JSON
    const responseText = await response.text();
    
    // Log pour débogage en cas d'erreur
    if (!response.ok) {
      console.error('External API error response:', responseText);
      return NextResponse.json(
        { success: false, error: `API error: ${response.status} ${response.statusText}` }, 
        { status: response.status }
      );
    }

    let result;
    try {
      // Tenter de parser le texte en JSON
      result = JSON.parse(responseText);
    } catch (_parseError) {
      console.error('Failed to parse JSON response:', responseText.substring(0, 200), _parseError);
      return NextResponse.json(
        { success: false, error: 'Failed to parse API response' }, 
        { status: 500 }
      );
    }

    // Vérifier le statut du transfert
    const transferStatus = result.transfer?.status;
    const isSuccessful = transferStatus === 'sent' || transferStatus === 'complete';

    return NextResponse.json({
      success: isSuccessful,
      data: result,
      message: isSuccessful 
        ? 'Transfer processed successfully!' 
        : `Transfer initiated but status is ${transferStatus}. Please check again later.`,
    });

  } catch (error: any) {
    console.error('Transfer API error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'An unexpected error occurred' }, 
      { status: 500 }
    );
  }
}