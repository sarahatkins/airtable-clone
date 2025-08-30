const CreateNewRowButton = () => {
  return (
    <div className="p-2 bg-white border-t">
  <button
    onClick={addNewRow}
    className="flex items-center gap-1 rounded bg-blue-500 px-3 py-1 text-white hover:bg-blue-600"
  >
    <Plus size={16} />
    Add Row
  </button>
</div>

  )
}