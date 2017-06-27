import _ from '../../lib/lodash';
import Command from './command';
import FactionIDs from '../config/factionIds';
import AddResources  from '../actions/addResources';

class Pass extends Command {

    static doExecute(state, args) {
        console.log('*** ' + args.faction.name + ' Passes *** ');
        const faction = args.faction;
        AddResources.execute(state, { factionId: faction.id, count: faction.passResources });
    }
}

export default Pass;