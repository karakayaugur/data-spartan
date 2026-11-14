interface CharacterBase {
  id: number;
  name: string;
  height: string;
}

export interface RobotCharacter extends CharacterBase {
  kind: "robot";
  mass: string;
  manufacturingYear: string;
}

export interface OrganicCharacter extends CharacterBase {
  kind: "organic";
  birthYear: string;
  homeworld: string;
  species: { name: string; classification: string }[];
}

export type Character = RobotCharacter | OrganicCharacter;
