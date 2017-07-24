import Scenario from '../../common/scenario';
import FactionIDs from '../config/factionIds';
import RegionIDs from '../config/regionIds';
import TribeIDs from '../config/tribeIds';
import Cards from '../config/cards';

import PlaceWarbands from '../actions/placeWarbands';
import PlaceAlliedTribe from '../actions/placeAlliedTribe';
import PlaceCitadel from '../actions/placeCitadel';
import PlaceLeader from '../actions/placeLeader';
import PlaceAuxilia from '../actions/placeAuxilia';
import PlaceFort from '../actions/placeFort';
import PlaceLegions from '../actions/placeLegions';

import DisperseTribe from '../actions/disperseTribe';
import { SenateApprovalStates } from '../config/senateApprovalStates';

class TheGreatRevolt extends Scenario {

    static initializeGameState( state ) {
        const belgae = state.factionsById[FactionIDs.BELGAE];
        const arverni = state.factionsById[FactionIDs.ARVERNI];
        const aedui = state.factionsById[FactionIDs.AEDUI];
        const romans = state.factionsById[FactionIDs.ROMANS];
        const germanic = state.factionsById[FactionIDs.GERMANIC_TRIBES];

        const deck = Cards.generateDeck(3);
        state.setDeck(deck);
        state.setYearsRemaining(3);

        belgae.setResources(10);
        aedui.setResources(15);
        arverni.setResources(20);
        romans.setResources(20);

        romans.setSenateApproval(SenateApprovalStates.INTRIGUE);
        romans.initializeLegionTrack(SenateApprovalStates.ADULATION, 2);

        const moriniRegion = state.regionsById[RegionIDs.MORINI];
        PlaceAlliedTribe.execute(state, { factionId: belgae.id, regionId: moriniRegion.id, tribeId: TribeIDs.MORINI});
        PlaceWarbands.execute(state, { factionId: belgae.id, regionId: moriniRegion.id, count: 4});

        const nerviiRegion = state.regionsById[RegionIDs.NERVII];
        DisperseTribe.execute(state, { factionId: romans.id, tribeId : TribeIDs.EBURONES });
        PlaceFort.execute(state, { factionId: romans.id, regionId: nerviiRegion.id});
        PlaceAuxilia.execute(state, { factionId: romans.id, regionId: nerviiRegion.id, count: 2});
        PlaceWarbands.execute(state, { factionId: belgae.id, regionId: nerviiRegion.id, count: 1});
        PlaceWarbands.execute(state, { factionId: germanic.id, regionId: nerviiRegion.id, count: 1});

        const atrebatesRegion = state.regionsById[RegionIDs.ATREBATES];
        PlaceAlliedTribe.execute(state, { factionId: belgae.id, regionId: atrebatesRegion.id, tribeId: TribeIDs.BELLOVACI});
        PlaceWarbands.execute(state, { factionId: belgae.id, regionId: atrebatesRegion.id, count: 1});
        PlaceAlliedTribe.execute(state, { factionId: romans.id, regionId: atrebatesRegion.id, tribeId: TribeIDs.REMI});
        PlaceAuxilia.execute(state, { factionId: romans.id, regionId: atrebatesRegion.id, count: 2});

        const sugambriRegion = state.regionsById[RegionIDs.SUGAMBRI];
        PlaceLeader.execute(state, { factionId: belgae.id, regionId: sugambriRegion.id});
        PlaceWarbands.execute(state, { factionId: belgae.id, regionId: sugambriRegion.id, count: 4});
        PlaceAlliedTribe.execute(state, { factionId: germanic.id, regionId: sugambriRegion.id, tribeId: TribeIDs.SUGAMBRI});
        PlaceAlliedTribe.execute(state, { factionId: germanic.id, regionId: sugambriRegion.id, tribeId: TribeIDs.SUEBI_NORTH});
        PlaceWarbands.execute(state, { factionId: germanic.id, regionId: sugambriRegion.id, count: 2});

        const ubiiRegion = state.regionsById[RegionIDs.UBII];
        PlaceAlliedTribe.execute(state, { factionId: germanic.id, regionId: ubiiRegion.id, tribeId: TribeIDs.SUEBI_SOUTH});
        PlaceWarbands.execute(state, { factionId: germanic.id, regionId: ubiiRegion.id, count: 1});

        const treveriRegion = state.regionsById[RegionIDs.TREVERI];
        PlaceWarbands.execute(state, { factionId: germanic.id, regionId: treveriRegion.id, count: 2});
        PlaceFort.execute(state, { factionId: romans.id, regionId: treveriRegion.id});
        PlaceLegions.execute(state, { factionId: romans.id, regionId: treveriRegion.id, count: 2});
        PlaceAuxilia.execute(state, { factionId: romans.id, regionId: treveriRegion.id, count: 2});

        const venetiRegion = state.regionsById[RegionIDs.VENETI];
        PlaceAlliedTribe.execute(state, { factionId: arverni.id, regionId: venetiRegion.id, tribeId: TribeIDs.NAMNETES});
        PlaceWarbands.execute(state, { factionId: arverni.id, regionId: venetiRegion.id, count: 2});

        const carnutesRegion = state.regionsById[RegionIDs.CARNUTES];
        PlaceLeader.execute(state, { factionId: arverni.id, regionId: carnutesRegion.id});
        PlaceAlliedTribe.execute(state, { factionId: arverni.id, regionId: carnutesRegion.id, tribeId: TribeIDs.CARNUTES});
        PlaceAlliedTribe.execute(state, { factionId: arverni.id, regionId: carnutesRegion.id, tribeId: TribeIDs.AULERCI});
        PlaceWarbands.execute(state, { factionId: arverni.id, regionId: carnutesRegion.id, count: 10});

        const mandubiiRegion = state.regionsById[RegionIDs.MANDUBII];
        PlaceAlliedTribe.execute(state, { factionId: arverni.id, regionId: mandubiiRegion.id, tribeId: TribeIDs.SENONES});
        PlaceWarbands.execute(state, { factionId: arverni.id, regionId: mandubiiRegion.id, count: 4});
        PlaceAlliedTribe.execute(state, { factionId: aedui.id, regionId: mandubiiRegion.id, tribeId: TribeIDs.MANDUBII});
        PlaceWarbands.execute(state, { factionId: aedui.id, regionId: mandubiiRegion.id, count: 4});
        PlaceAlliedTribe.execute(state, { factionId: romans.id, regionId: mandubiiRegion.id, tribeId: TribeIDs.LINGONES});
        PlaceFort.execute(state, { factionId: romans.id, regionId: mandubiiRegion.id});
        PlaceLegions.execute(state, { factionId: romans.id, regionId: mandubiiRegion.id, count: 8});
        PlaceAuxilia.execute(state, { factionId: romans.id, regionId: mandubiiRegion.id, count: 2});

        const pictonesRegion = state.regionsById[RegionIDs.PICTONES];
        PlaceAlliedTribe.execute(state, { factionId: arverni.id, regionId: pictonesRegion.id, tribeId: TribeIDs.PICTONES});
        PlaceAlliedTribe.execute(state, { factionId: arverni.id, regionId: pictonesRegion.id, tribeId: TribeIDs.SANTONES});
        PlaceWarbands.execute(state, { factionId: arverni.id, regionId: pictonesRegion.id, count: 2});

        const biturigesRegion = state.regionsById[RegionIDs.BITURIGES];
        PlaceAlliedTribe.execute(state, { factionId: aedui.id, regionId: biturigesRegion.id, tribeId: TribeIDs.BITURIGES});
        PlaceWarbands.execute(state, { factionId: aedui.id, regionId: biturigesRegion.id, count: 4});

        const aeduiRegion = state.regionsById[RegionIDs.AEDUI];
        PlaceCitadel.execute(state, { factionId: aedui.id, regionId: aeduiRegion.id, tribeId: TribeIDs.AEDUI}, true);
        PlaceWarbands.execute(state, { factionId: aedui.id, regionId: aeduiRegion.id, count: 6});

        const sequaniRegion = state.regionsById[RegionIDs.SEQUANI];
        PlaceAlliedTribe.execute(state, { factionId: arverni.id, regionId: sequaniRegion.id, tribeId: TribeIDs.SEQUANI});
        PlaceAlliedTribe.execute(state, { factionId: arverni.id, regionId: sequaniRegion.id, tribeId: TribeIDs.HELVETII});
        PlaceWarbands.execute(state, { factionId: arverni.id, regionId: sequaniRegion.id, count: 1});

        const arverniRegion = state.regionsById[RegionIDs.ARVERNI];
        PlaceCitadel.execute(state, { factionId: arverni.id, regionId: arverniRegion.id, tribeId: TribeIDs.ARVERNI}, true);
        PlaceAlliedTribe.execute(state, { factionId: arverni.id, regionId: arverniRegion.id, tribeId: TribeIDs.CADURCI});
        PlaceWarbands.execute(state, { factionId: arverni.id, regionId: arverniRegion.id, count: 10});

        const provinciaRegion = state.regionsById[RegionIDs.PROVINCIA];
        PlaceLeader.execute(state, { factionId: romans.id, regionId: provinciaRegion.id});
        PlaceAuxilia.execute(state, { factionId: romans.id, regionId: provinciaRegion.id, count: 6});
        PlaceAlliedTribe.execute(state, { factionId: romans.id, regionId: provinciaRegion.id, tribeId: TribeIDs.HELVII});
        PlaceFort.execute(state, { factionId: romans.id, regionId: provinciaRegion.id});
    }
}

export default TheGreatRevolt;
