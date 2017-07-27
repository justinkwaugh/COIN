import _ from 'lib/lodash';
import Action from './action';

class PromoteSuccessor extends Action {

    constructor(args) {
        super(args);

        this.factionId = args.factionId;
    }

    doExecute(state) {
        const faction = state.factionsById[this.factionId];
        let leader = this.findLeader(state);
        if(!leader || !leader.isSuccessor()) {
            throw 'No successor leader found for faction ' + faction.name;
        }

        leader.isSuccessor(false);
        console.log('Promoting ' + faction.name + ' successor');
    }

    doUndo(state) {
        let leader = this.findLeader(state);
        leader.isSuccessor(true);
        console.log('Demoting ' + faction.name + ' leader');
    }

    instructions(state) {
        const faction = state.factionsById[this.factionId];
        return ['Flip ' + faction.name + ' leader from successor'];
    }

    findLeader(state ) {
        const faction = state.factionsById[this.factionId];
        let leader = faction.hasAvailableLeader();
        if(!leader) {
            const leaderRegion = _.find(state.regions, region=> region.getLeaderForFaction(this.factionId));
            if(leaderRegion) {
                leader = leaderRegion.getLeaderForFaction(this.factionId);
            }
        }
        return leader;
    }

}

export default PromoteSuccessor
