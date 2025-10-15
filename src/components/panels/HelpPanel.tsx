export function HelpPanel() {
  return (
    <div className="flex h-full flex-col gap-6 rounded-lg bg-background/70 p-6 text-sm text-muted-foreground">
      <div>
        <h2 className="text-base font-medium text-foreground">Ayuda rápida</h2>
        <p>
          Usa el inspector para editar el título y la descripción de cada nodo.
          Puedes organizar el flujo desde el lienzo arrastrando nodos y
          conexiones.
        </p>
      </div>
      <div className="space-y-1">
        <h3 className="text-sm font-medium text-foreground">
          Atajos del diagrama
        </h3>
        <ul className="marker:text-muted-foreground/60 list-disc space-y-1 pl-4">
          <li>
            Selecciona un nodo y presiona <kbd className="rounded bg-muted px-1">Del</kbd> para
            eliminarlo.
          </li>
          <li>
            Mantén presionada la tecla <kbd className="rounded bg-muted px-1">Shift</kbd> para
            seleccionar varios nodos.
          </li>
          <li>
            Usa la rueda del ratón o <kbd className="rounded bg-muted px-1">Ctrl</kbd> +{" "}
            <kbd className="rounded bg-muted px-1">+</kbd>/<kbd className="rounded bg-muted px-1">-</kbd>{" "}
            para acercar o alejar el lienzo.
          </li>
        </ul>
      </div>
      <div className="space-y-1">
        <h3 className="text-sm font-medium text-foreground">Consejos</h3>
        <ul className="marker:text-muted-foreground/60 list-disc space-y-1 pl-4">
          <li>Mantén descripciones cortas y accionables.</li>
          <li>
            Usa el panel de vista previa para copiar el JSON o el diagrama
            Mermaid.
          </li>
          <li>
            Ejecuta el autolayout desde la barra superior si el flujo se ve
            desordenado.
          </li>
        </ul>
      </div>
    </div>
  );
}
