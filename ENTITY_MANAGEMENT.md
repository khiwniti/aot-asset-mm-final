# Interactive Domain Entity Management System

## Overview

The Interactive Domain Entity Management System is a comprehensive solution for managing workflows, tasks, leases, and maintenance requests in real-time with optimistic updates and cross-tab synchronization.

## Architecture

### Core Components

#### 1. Entity Types
- **Workflow**: Coordinates multiple tasks and stakeholders through lifecycle stages
- **Task**: Individual work items within workflows or standalone
- **Lease**: Rental agreements with automatic expiration tracking
- **MaintenanceRequest**: Work orders with cost and priority management

#### 2. UI Components
- **WorkflowStatusManager**: Kanban-style workflow board with drag-and-drop
- **TaskBoard**: Task management with status columns and bulk operations
- **LeaseManager**: Lease lifecycle management with renewal alerts
- **MaintenanceTracker**: Maintenance request tracking with cost monitoring

#### 3. Services
- **entitySyncService**: Real-time synchronization with conflict resolution
- **livekitChatService**: Enhanced chat service with entity commands
- **LiveKit Agent**: Voice-enabled AI with entity management capabilities

## Features

### Real-Time Synchronization
- Cross-tab state synchronization using localStorage events
- Optimistic updates with automatic rollback
- Conflict detection and resolution UI
- Pending operations queue for network failures

### Interactive Management
- Drag-and-drop status transitions
- Bulk selection and operations
- Inline editing capabilities
- Context-aware filtering and sorting

### Voice Integration
- Natural language entity creation commands
- Voice-activated status updates
- Context-aware suggestions
- Bilingual support (English/Thai)

## Usage Examples

### Voice Commands
```
"Create a workflow for Q1 budget review assigned to Sarah due March 31st"
"Show my workflows"
"Create task: Review tenant applications for Airport Plaza, assign to me, due Friday"
"Show task board"
"Show leases expiring in next 60 days"
"Create maintenance request for broken HVAC at Terminal Building, estimate $5000"
"Show maintenance tracker"
```

### Text Commands
```
"show workflows" - Display workflow manager
"show task board" - Display Kanban task board
"show lease manager" - Display lease management interface
"show maintenance tracker" - Display maintenance request tracker
"create workflow [title]" - Create new workflow
"create task [title]" - Create new task
```

## Technical Implementation

### Performance Targets
- **Entity CRUD Operations**: <500ms under normal load
- **UI Updates**: <200ms optimistic display
- **Cross-Tab Sync**: <1 second for 95% of cases
- **Bulk Operations**: <5 seconds for 50 entities
- **Concurrent Users**: 100+ without degradation

### Data Flow
1. User action triggers optimistic UI update
2. Entity sync service queues operation
3. Cross-tab broadcast via localStorage events
4. Backend persistence with retry logic
5. Conflict resolution if needed
6. Audit trail entry for all changes

### Error Handling
- Automatic retry with exponential backoff (3 attempts max)
- Graceful rollback on failed operations
- User-friendly error messages
- Debug mode for pending operations

## Deployment

### Frontend
- Built with React 18.3.1 and TypeScript
- Styled with Tailwind CSS
- Component-based architecture
- LiveKit integration for voice features

### Backend
- LiveKit Cloud for voice processing
- Entity sync service for state management
- Mock data service for development
- Production-ready for database integration

### LiveKit Agent
- Python-based voice assistant
- Enhanced with entity management commands
- Context-aware responses
- Multi-language support

## Development

### Getting Started
1. Install dependencies: `npm install`
2. Start development: `npm run dev`
3. Configure environment variables in `.env`
4. Deploy agent to LiveKit Cloud Console

### Environment Variables
```bash
LIVEKIT_API_KEY=your_api_key
LIVEKIT_API_SECRET=your_api_secret
LIVEKIT_URL=wss://your-livekit-instance.livekit.cloud
```

### Testing
- Unit tests for entity operations
- Integration tests for sync service
- E2E tests for drag-and-drop
- Voice command testing with LiveKit

## Future Enhancements

### Planned Features
- Advanced analytics and reporting
- Mobile-responsive design improvements
- Advanced conflict resolution algorithms
- Integration with calendar systems
- Automated workflow templates
- Enhanced notification system

### Scalability
- Database integration for production
- Microservices architecture
- Load balancing for high traffic
- Caching strategies
- Performance monitoring

## Troubleshooting

### Common Issues
- **Drag and drop not working**: Check react-beautiful-dnd replacement
- **Cross-tab sync failing**: Verify localStorage permissions
- **Voice commands not recognized**: Check LiveKit agent deployment
- **Entity creation failing**: Verify required fields and permissions

### Debug Mode
Enable debug logging in entity sync service:
```javascript
entitySyncService.setDebugMode(true);
```

## Documentation

- [LIVEKIT_README.md](./LIVEKIT_README.md) - LiveKit setup guide
- [LIVEKIT_DEPLOYMENT.md](./LIVEKIT_DEPLOYMENT.md) - Deployment instructions
- [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) - Migration from Gemini

## Support

For issues and questions:
1. Check console logs for error details
2. Verify LiveKit agent status in Cloud Console
3. Test with voice and text commands
4. Review entity audit trail for failed operations