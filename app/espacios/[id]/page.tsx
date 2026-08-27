export default async function EspacioDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <main className="p-8">
      <h1 className="text-2xl font-semibold">Espacio {id}</h1>
    </main>
  );
}
