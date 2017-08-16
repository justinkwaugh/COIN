import _ from '../../lib/lodash';
import ko from '../../lib/knockout';

import Regions from '../config/regions';
import RegionIDs from '../config/regionIds';
import Tribes from '../config/tribes';
import TribeIDs from '../config/tribeIds';

class FallingSkyVassal {
  constructor() {

    // define regions

    this.regions = {
      AED: {
        key: "AED",
        name: "Aedui",
        modname: "Celctica (Aedui)",
        ally: 1,
        citadel: 1,
        id: RegionIDs.AEDUI
      },
      ARV: {
        key: "ARV",
        name: "Arverni",
        modname: "Celtica (Arverni, Cadurci, Volcae)",
        ally: 3,
        citadel: 1,
        id: RegionIDs.ARVERNI
      },
      ATR: {
        key: "ATR",
        name: "Atrebates",
        modname: "Belcica (Atrebates, Bellovaci, Remi)",
        ally: 3,
        citadel: 0,
        id: RegionIDs.ATREBATES
      },
      BIT: {
        key: "BIT",
        name: "Bituriges",
        modname: "Celtica (Bituriges)",
        ally: 1,
        citadel: 1,
        id: RegionIDs.BITURIGES
      },
      CAT: {
        key: "CAT",
        name: "Britannia",
        modname: "Britannia",
        ally: 1,
        citadel: 0,
        id: RegionIDs.BRITANNIA
      },
      CAR: {
        key: "CAR",
        name: "Carnutes",
        modname: "Celtica (Aulerci, Carnutes)",
        ally: 2,
        citadel: 1,
        id: RegionIDs.CARNUTES
      },
      HEL: {
        key: "HEL",
        name: "Provincia",
        modname: "Provincia",
        ally: 1,
        citadel: 0,
        id: RegionIDs.PROVINCIA
      },
      MAN: {
        key: "MAN",
        name: "Mandubii",
        modname: "Celtica (Senones, Mandubii, Lingones)",
        ally: 3,
        citadel: 1,
        id: RegionIDs.MANDUBII
      },
      MOR: {
        key: "MOR",
        name: "Morini",
        modname: "Belgica (Morini, Menapii)",
        ally: 2,
        citadel: 0,
        id: RegionIDs.MORINI
      },
      NER: {
        key: "NER",
        name: "Nervii",
        modname: "Belgica (Nervii)",
        ally: 2,
        citadel: 0,
        id: RegionIDs.NERVII
      },
      PIC: {
        key: "PIC",
        name: "Pictones",
        modname: "Celctica (Pictones, Santones)",
        ally: 2,
        citadel: 0,
        id: RegionIDs.PICTONES
      },
      SEQ: {
        key: "SEQ",
        name: "Sequani",
        modname: "Celtica (Sequani, Helvetii)",
        ally: 2,
        citadel: 1,
        id: RegionIDs.SEQUANI
      },
      SUG: {
        key: "SUG",
        name: "Sugambri",
        modname: "Germania (Sugambri, Suebi)",
        ally: 2,
        citadel: 0,
        id: RegionIDs.SUGAMBRI
      },
      TRE: {
        key: "TRE",
        name: "Treveri",
        modname: "Celtica (Treveri)",
        ally: 1,
        citadel: 0,
        id: RegionIDs.TREVERI
      },
      UBI: {
        key: "UBI",
        name: "Ubii",
        modname: "Germania (Ubii, Suebi)",
        ally: 2,
        citadel: 0,
        id: RegionIDs.UBII
      },
      VEN: {
        key: "VEN",
        name: "Veneti",
        modname: "Celtica (Veneti, Namnetes)",
        ally: 2,
        citadel: 0,
        id: RegionIDs.VENETI
      }
    };

    // define tribes

    this.tribes = [
      {
        x: 2519,
        y: 1588,
        id: TribeIDs.AEDUI
      },
      {
        x: 2414,
        y: 1978,
        id: TribeIDs.ARVERNI
      },
      {
        x: 2073,
        y: 593,
        id: TribeIDs.ATREBATES
      },
      {
        x: 1848,
        y: 1022,
        id: TribeIDs.AULERCI
      },
      {
        x: 2266,
        y: 723,
        id: TribeIDs.BELLOVACI
      },
      {
        x: 2112,
        y: 1436,
        id: TribeIDs.BITURIGES
      },
      {
        x: 2146,
        y: 2205,
        id: TribeIDs.CADURCI
      },
      {
        x: 1784,
        y: 1260,
        id: TribeIDs.CARNUTES
      },
      {
        x: 1418,
        y: 227,
        id: TribeIDs.CATUVELLAUNI
      },
      {
        x: 3076,
        y: 293,
        id: TribeIDs.EBURONES
      },
      {
        x: 3403,
        y: 1492,
        id: TribeIDs.HELVETII
      },
      {
        x: 2784,
        y: 2252,
        id: TribeIDs.HELVII
      },
      {
        x: 2783,
        y: 1197,
        id: TribeIDs.LINGONES
      },
      {
        x: 2507,
        y: 1156,
        id: TribeIDs.MANDUBII
      },
      {
        x: 2527,
        y: 213,
        id: TribeIDs.MENAPII
      },
      {
        x: 2167,
        y: 383,
        id: TribeIDs.MORINI
      },
      {
        x: 1199,
        y: 1188,
        id: TribeIDs.NAMNETES
      },
      {
        x: 2675,
        y: 381,
        id: TribeIDs.NERVII
      },
      {
        x: 1338,
        y: 1576,
        id: TribeIDs.PICTONES
      },
      {
        x: 2651,
        y: 758,
        id: TribeIDs.REMI
      },
      {
        x: 1515,
        y: 1748,
        id: TribeIDs.SANTONES
      },
      {
        x: 2325,
        y: 1095,
        id: TribeIDs.SENONES
      },
      {
        x: 3042,
        y: 1491,
        id: TribeIDs.SEQUANI
      },
      {
        x: 3622,
        y: 216,
        id: TribeIDs.SUEBI_NORTH
      },
      {
        x: 3601,
        y: 1259,
        id: TribeIDs.SUEBI_SOUTH
      },
      {
        x: 3330,
        y: 216,
        id: TribeIDs.SUGAMBRI
      },
      {
        x: 3061,
        y: 683,
        id: TribeIDs.TREVERI
      },
      {
        x: 3657,
        y: 765,
        id: TribeIDs.UBII
      },
      {
        x: 931,
        y: 1127,
        id: TribeIDs.VENETI
      },
      {
        x: 1893,
        y: 2406,
        id: TribeIDs.VOLCAE
      }
    ];
  }

  tribeId(state, pieceName, regionId, x, y) {
    for (let i = 0; i < this.tribes.length; i++) {
      let tribe = state.tribesById[this.tribes[i].id];

      if (this.tribes[i].x == x && this.tribes[i].y == y && tribe.regionId == regionId)
        return this.tribes[i].id;
    }

    // if coordinates don't match, then it might be a colony tribe

    var colony = state.tribesById[TribeIDs.COLONY];
    if (colony !== null && colony.regionId == regionId)
      return TribeIDs.COLONY;

    throw 'Could not find valid tribe for piece ' + pieceName + ' at location ' + x + ', ' + y + ' in region ' + regionId;
  }
}

export default FallingSkyVassal;