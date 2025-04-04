interface Props {
    params: {
        order: string;
        lang: string;
    }
}

export default function SuccessPage({ params }: Props) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
                <div className="mb-4 text-green-500">
                    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h1 className="text-2xl font-bold text-gray-800 mb-4">Commande Confirmée!</h1>
                <p className="text-gray-600 mb-4">
                    Votre commande #{params.order} a été traitée avec succès.
                </p>
                <p className="text-sm text-gray-500">
                    Un email de confirmation vous sera envoyé prochainement.
                </p>
            </div>
        </div>
    )
}
