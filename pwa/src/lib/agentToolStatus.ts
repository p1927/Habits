export function toolStatusLabel(tool: string): string {
  switch (tool) {
    case 'log_food':
    case 'log_food_item':
      return 'Logging food…';
    case 'search_food':
    case 'get_food_today':
      return 'Checking food log…';
    case 'create_event':
    case 'update_calendar_event':
    case 'delete_calendar_event':
    case 'list_calendar_events':
      return 'Checking calendar…';
    case 'update_habit':
      return 'Updating habits…';
    case 'add_card':
      return 'Adding card…';
    default:
      return 'Working…';
  }
}
