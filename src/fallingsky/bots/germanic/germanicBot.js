import Bot from '../bot';
import _ from '../../../lib/lodash';
import FactionIDs from '../../config/factionIds';
import CommandIDs from 'fallingsky/config/commandIds';
import RegionIDs from '../../config/regionIds';
import GermanicRally from './germanicRally';
import GermanicMarch from './germanicMarch';
import GermanicRaid from './germanicRaid';
import GermanicBattle from './germanicBattle';
import TurnContext from 'common/turnContext'
import MovePieces from '../../actions/movePieces';

class GermanicBot extends Bot {
    constructor() {
        super({factionId: FactionIDs.GERMANIC_TRIBES});
    }

    takeTurn(state) {
        const turn = state.turnHistory.currentTurn;
        const modifiers = turn.getContext();
        if (!modifiers.isCommandAllowed(CommandIDs.RALLY)) {
            GermanicRally.rally(state, new TurnContext({winter: true}));
        }
        GermanicMarch.march(state, new TurnContext({winter: true}));
        GermanicRaid.raid(state, new TurnContext({winter: true}));
        GermanicBattle.battle(state, new TurnContext({winter: true}));
    }

    willHarass(factionId) {
        return true;
    }

    quarters(state) {
        _(state.regions).filter(function(region) {
            return region.devastated();
        }).map((region) => {
            const pieces = region.piecesByFaction()[this.factionId] || [];
            if(pieces.length === 0) {
                return;
            }
            const hasAlly = _.find(pieces, { type : 'alliedtribe'});
            if(!hasAlly) {
                return { region, pieces };
            }
        }).compact().each(function(relocation) {
            const germaniaRegion = state.regionsById[_.sample([RegionIDs.SUGAMBRI, RegionIDs.UBII])];
            MovePieces.execute(state, {sourceRegionId: relocation.region.id, destRegionId: germaniaRegion.id, pieces: relocation.pieces});
        });
    }
}

export default GermanicBot;