

export default async function FailurePage({ params }: { params:  Promise<{ order : string}> }) {
    const order = (await params).order
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
                <div className="mb-4 text-red-500">
                    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </div>
                <h1 className="text-2xl font-bold text-gray-800 mb-4">Échec de la Commande</h1>
                <p className="text-gray-600 mb-4">
                    Désolé, un problème est survenu avec votre commande #{order}.
                </p>
                <p className="text-sm text-gray-500">
                    Veuillez réessayer plus tard ou contacter notre service client.
                </p>
            </div>
        </div>
    )
}
