import { RunService, Players, ServerScriptService } from "@rbxts/services";

const templates = script.WaitForChild("templates") as Folder;
const serverExecutorTemplate = templates.WaitForChild("ServerExecutor") as ModuleScript;
const clientExecutorTemplate = templates.WaitForChild("ClientExecutor") as ModuleScript;

const ACTOR_FOLDER_NAME = "DirectorActors";

function getOrCreateFolder(parent: Instance, folderName: string) {
	for (const child of parent.GetChildren()) {
		if (child.IsA("Folder") && child.Name === folderName) {
			return child;
		}
	}
	const folder = new Instance("Folder");
	folder.Name = folderName;
	return folder;
}

function getActorFolder() {
	if (RunService.IsServer()) {
		return getOrCreateFolder(ServerScriptService, ACTOR_FOLDER_NAME);
	} else {
		const playerScripts = Players.LocalPlayer.FindFirstChildOfClass("PlayerScripts");
		assert(playerScripts);
		return getOrCreateFolder(playerScripts, ACTOR_FOLDER_NAME);
	}
}

function getExecutorTemplate() {
	return RunService.IsServer() ? serverExecutorTemplate : clientExecutorTemplate;
}

function createActor(moduleScript: ModuleScript, parent: Instance) {
	const actor = new Instance("Actor");

	const executor = getExecutorTemplate().Clone();
	executor.Parent = actor;

	const ref = new Instance("ObjectValue");
	ref.Name = "ModuleReference";
	ref.Value = moduleScript;
	ref.Parent = executor;

	actor.Parent = parent;

	return actor;
}

namespace Director {
	export function execute(moduleScript: ModuleScript, amount: number) {
		const folder = getActorFolder();

		const actors = new Array<Actor>();
		for (let i = 0; i < amount; i++) {
			actors[i] = createActor(moduleScript, folder);
		}

		return () => {
			for (let i = 0; i < amount; i++) {
				actors[i].Destroy();
			}
		};
	}
}

export = Director;
