import Scenario from '../../common/scenario'
import FactionIDs from '../config/factionIds'
import RegionIDs from '../config/regionIds'
import TribeIDs from '../config/tribeIds'
import Cards from '../config/cards'

import PlaceWarbands from '../actions/placeWarbands'
import PlaceAlliedTribe from '../actions/placeAlliedTribe'
import PlaceCitadel from '../actions/placeCitadel'
import PlaceLeader from '../actions/placeLeader'
import PlaceAuxilia from '../actions/placeAuxilia'
import PlaceFort from '../actions/placeFort'
import PlaceLegions from '../actions/placeLegions'

import DisperseTribe from '../actions/disperseTribe'
import SenateApprovalStates from '../config/senateApprovalStates';

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
        PlaceAlliedTribe.perform(state, { faction: belgae, region: moriniRegion, tribeId: TribeIDs.MORINI});
        PlaceWarbands.perform(state, { faction: belgae, region: moriniRegion, count: 4});

        const nerviiRegion = state.regionsById[RegionIDs.NERVII];
        DisperseTribe.run(state, { factionId: romans.id, tribeId : TribeIDs.EBURONES });
        PlaceFort.perform(state, { faction: romans, region: nerviiRegion});
        PlaceAuxilia.perform(state, { faction: romans, region: nerviiRegion, count: 2});
        PlaceWarbands.perform(state, { faction: belgae, region: nerviiRegion, count: 1});
        PlaceWarbands.perform(state, { faction: germanic, region: nerviiRegion, count: 1});

        const atrebatesRegion = state.regionsById[RegionIDs.ATREBATES];
        PlaceAlliedTribe.perform(state, { faction: belgae, region: atrebatesRegion, tribeId: TribeIDs.BELLOVACI});
        PlaceWarbands.perform(state, { faction: belgae, region: atrebatesRegion, count: 1});
        PlaceAlliedTribe.perform(state, { faction: romans, region: atrebatesRegion, tribeId: TribeIDs.REMI});
        PlaceAuxilia.perform(state, { faction: romans, region: atrebatesRegion, count: 2});

        const sugambriRegion = state.regionsById[RegionIDs.SUGAMBRI];
        PlaceLeader.perform(state, { faction: belgae, region: sugambriRegion});
        PlaceWarbands.perform(state, { faction: belgae, region: sugambriRegion, count: 4});
        PlaceAlliedTribe.perform(state, { faction: germanic, region: sugambriRegion, tribeId: TribeIDs.SUGAMBRI});
        PlaceAlliedTribe.perform(state, { faction: germanic, region: sugambriRegion, tribeId: TribeIDs.SUEBI_NORTH});
        PlaceWarbands.perform(state, { faction: germanic, region: sugambriRegion, count: 2});

        const ubiiRegion = state.regionsById[RegionIDs.UBII];
        PlaceAlliedTribe.perform(state, { faction: germanic, region: ubiiRegion, tribeId: TribeIDs.SUEBI_SOUTH});
        PlaceWarbands.perform(state, { faction: germanic, region: ubiiRegion, count: 1});

        const treveriRegion = state.regionsById[RegionIDs.TREVERI];
        PlaceWarbands.perform(state, { faction: germanic, region: treveriRegion, count: 2});
        PlaceFort.perform(state, { faction: romans, region: treveriRegion});
        PlaceLegions.perform(state, { faction: romans, region: treveriRegion, count: 2});
        PlaceAuxilia.perform(state, { faction: romans, region: treveriRegion, count: 2});

        const venetiRegion = state.regionsById[RegionIDs.VENETI];
        PlaceAlliedTribe.perform(state, { faction: arverni, region: venetiRegion, tribeId: TribeIDs.NAMNETES});
        PlaceWarbands.perform(state, { faction: arverni, region: venetiRegion, count: 2});

        const carnutesRegion = state.regionsById[RegionIDs.CARNUTES];
        PlaceLeader.perform(state, { faction: arverni, region: carnutesRegion});
        PlaceAlliedTribe.perform(state, { faction: arverni, region: carnutesRegion, tribeId: TribeIDs.CARNUTES});
        PlaceAlliedTribe.perform(state, { faction: arverni, region: carnutesRegion, tribeId: TribeIDs.AULERCI});
        PlaceWarbands.perform(state, { faction: arverni, region: carnutesRegion, count: 10});

        const mandubiiRegion = state.regionsById[RegionIDs.MANDUBII];
        PlaceAlliedTribe.perform(state, { faction: arverni, region: mandubiiRegion, tribeId: TribeIDs.SENONES});
        PlaceWarbands.perform(state, { faction: arverni, region: mandubiiRegion, count: 4});
        PlaceAlliedTribe.perform(state, { faction: aedui, region: mandubiiRegion, tribeId: TribeIDs.MANDUBII});
        PlaceWarbands.perform(state, { faction: aedui, region: mandubiiRegion, count: 4});
        PlaceAlliedTribe.perform(state, { faction: romans, region: mandubiiRegion, tribeId: TribeIDs.LINGONES});
        PlaceFort.perform(state, { faction: romans, region: mandubiiRegion});
        PlaceLegions.perform(state, { faction: romans, region: mandubiiRegion, count: 8});
        PlaceAuxilia.perform(state, { faction: romans, region: mandubiiRegion, count: 2});

        const pictonesRegion = state.regionsById[RegionIDs.PICTONES];
        PlaceAlliedTribe.perform(state, { faction: arverni, region: pictonesRegion, tribeId: TribeIDs.PICTONES});
        PlaceAlliedTribe.perform(state, { faction: arverni, region: pictonesRegion, tribeId: TribeIDs.SANTONES});
        PlaceWarbands.perform(state, { faction: arverni, region: pictonesRegion, count: 2});

        const biturigesRegion = state.regionsById[RegionIDs.BITURIGES];
        PlaceAlliedTribe.perform(state, { faction: aedui, region: biturigesRegion, tribeId: TribeIDs.BITURIGES});
        PlaceWarbands.perform(state, { faction: aedui, region: biturigesRegion, count: 4});

        const aeduiRegion = state.regionsById[RegionIDs.AEDUI];
        PlaceCitadel.perform(state, { faction: aedui, region: aeduiRegion, tribeId: TribeIDs.AEDUI}, true);
        PlaceWarbands.perform(state, { faction: aedui, region: aeduiRegion, count: 6});

        const sequaniRegion = state.regionsById[RegionIDs.SEQUANI];
        PlaceAlliedTribe.perform(state, { faction: arverni, region: sequaniRegion, tribeId: TribeIDs.SEQUANI});
        PlaceAlliedTribe.perform(state, { faction: arverni, region: sequaniRegion, tribeId: TribeIDs.HELVETII});
        PlaceWarbands.perform(state, { faction: arverni, region: sequaniRegion, count: 1});

        const arverniRegion = state.regionsById[RegionIDs.ARVERNI];
        PlaceCitadel.perform(state, { faction: arverni, region: arverniRegion, tribeId: TribeIDs.ARVERNI}, true);
        PlaceAlliedTribe.perform(state, { faction: arverni, region: arverniRegion, tribeId: TribeIDs.CADURCI});
        PlaceWarbands.perform(state, { faction: arverni, region: arverniRegion, count: 10});

        const provinciaRegion = state.regionsById[RegionIDs.PROVINCIA];
        PlaceLeader.perform(state, { faction: romans, region: provinciaRegion});
        PlaceAuxilia.perform(state, { faction: romans, region: provinciaRegion, count: 6});
        PlaceAlliedTribe.perform(state, { faction: romans, region: provinciaRegion, tribeId: TribeIDs.HELVII});
        PlaceFort.perform(state, { faction: romans, region: provinciaRegion});
    }
}

export default TheGreatRevolt;
