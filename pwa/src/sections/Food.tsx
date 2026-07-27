import { FoodManualEntryForm } from '../components/FoodManualEntryForm';
import { FoodProteinProgressCard } from '../components/FoodProteinProgressCard';
import { FoodQuickLogForm } from '../components/FoodQuickLogForm';
import { FoodTodayLogList } from '../components/FoodTodayLogList';
import { useFoodSection } from '../hooks/useFoodSection';

interface FoodProps {
  serverOnline: boolean;
}

export function Food({ serverOnline }: FoodProps) {
  const {
    data,
    error,
    success,
    loading,
    description,
    setDescription,
    mealType,
    setMealType,
    foodName,
    setFoodName,
    quantity,
    setQuantity,
    searchResults,
    editingRow,
    editQty,
    setEditQty,
    handleVoiceLog,
    handleManualLog,
    handleDelete,
    handleSaveEdit,
    startEdit,
    cancelEdit,
    selectSearchResult,
  } = useFoodSection(serverOnline);

  return (
    <section className="section">
      <h1>Food Tracker</h1>
      <p className="muted">Synced to Daily calculation tab in your Nutrition Google Sheet.</p>

      {!serverOnline && (
        <div className="banner banner-warn banner-revolut">Mac server offline — connect to sync with Sheets.</div>
      )}

      {data && !data.sheets_connected && serverOnline && (
        <div className="banner banner-warn banner-revolut">
          Google not connected — go to Settings and connect Google Sheets.
        </div>
      )}

      <FoodProteinProgressCard data={data} />

      <FoodQuickLogForm
        description={description}
        mealType={mealType}
        loading={loading}
        serverOnline={serverOnline}
        onDescriptionChange={setDescription}
        onMealTypeChange={setMealType}
        onSubmit={handleVoiceLog}
      />

      <FoodManualEntryForm
        foodName={foodName}
        quantity={quantity}
        searchResults={searchResults}
        loading={loading}
        serverOnline={serverOnline}
        onFoodNameChange={setFoodName}
        onQuantityChange={setQuantity}
        onSelectSearchResult={selectSearchResult}
        onSubmit={handleManualLog}
      />

      <FoodTodayLogList
        data={data}
        editingRow={editingRow}
        editQty={editQty}
        loading={loading}
        onEditQtyChange={setEditQty}
        onStartEdit={startEdit}
        onCancelEdit={cancelEdit}
        onSaveEdit={(item) => void handleSaveEdit(item)}
        onDelete={(row) => void handleDelete(row)}
      />

      {success && <div className="banner banner-ok banner-revolut">{success}</div>}
      {error && <div className="banner banner-warn banner-revolut">{error}</div>}
    </section>
  );
}
