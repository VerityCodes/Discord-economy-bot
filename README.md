# 🇬🇧 British Roleplay Discord Bot

A feature-rich, custom-built Discord bot designed for a British Roleplay (RP) server. This bot features a dynamic economy, interactive button-based shops, a complex combat and medical system, real estate management, and a government tax system.

Built with **Node.js** and **Discord.js (v14)**, it uses a lightweight local JSON database for easy setup and fast read/write operations.

## ✨ Core Features

### 💰 1. Dynamic Economy & Tax System

Unlike standard bots, users earn money based on their roleplay activity (message length).

* **Income Formula:** Every 5 characters typed equals 1 unit of calculation.
* **Government Tax Modes (Manageable by Treasury):**
* 📈 **Positive:** The government takes £100 per unit (Users get £0).
* ⚖️ **Neutral:** £50 goes to the user, £50 goes to the government treasury.
* 📉 **Negative:** £100 goes to the user, and £50 is deducted from the government treasury (Stimulus mode).


* **Daily Subsidies:** The system automatically deposits £10,000 into the government treasury every 24 hours.

### 🛒 2. Interactive UI Shops

The bot auto-generates persistent, interactive panels (using `ActionRow` and `Buttons`) in specific channels.

* **🏪 Main Shop:** Buy clothes (changes nickname prefixes: `⚜️`, `⊰`, `୨`), Air Guns, Medical Injections (cheaper for doctors), and iPhones.
* **🕸️ Dark Web:** Purchase illegal weapons (Glocks, smuggled MP5s with limited ammo) and armor.
* **🚓 Police / 🪖 Military Armories:** Faction-exclusive shops for permanent, legal weapons (L85A3, MP5) and heavy armor (Plate Carriers, Ballistic Vests).

### ⚔️ 3. Advanced Combat & Armor System

Players can engage in combat using the `!shoot` command. Injuries are handled via **Discord Timeouts**.

* **Weapon Selection:** Users must set their active weapon via the `!gunset` interactive menu.
* **Damage Logic:**
* `L85A3`: 7 Days Timeout
* `Glock 17` / `MP5`: 1 Hour Timeout
* `Air Gun`: 1 Minute Timeout


* **Armor Mitigation:**
* **Plate Carrier:** Nullifies all damage except `L85A3` (reduces it to 1 hour).
* **Police Vest:** Reduces all standard weapon damage to 5 seconds.


* **Ammo System:** Smuggled MP5s (from the Dark Web) break after 7 uses. Faction MP5s have infinite ammo.

### 🏥 4. Automated Medical System

* Listens to `guildMemberUpdate` events. If a user is put in a Timeout (injured), the bot automatically sends an emergency ping to the Doctors in the Hospital channel.
* Doctors can use `!help @user` to revive (remove timeout) the injured player, consuming a Medical Injection in the process.
* The emergency alert auto-deletes when the player is fully healed.

### 🏠 5. Real Estate System

* Players can purchase homes via interactive panels.
* **Normal Citizens:** Pay £10,000.
* **Soldiers:** Get a 50% discount (£5,000).
* **Automation:** The bot instantly creates a private, permission-locked text channel for the buyer under the respective housing category.

---

## 📜 Commands List

| Command | Permission | Description |
| --- | --- | --- |
| `!view [@user]` | `@everyone` | Displays a detailed profile (Balance, Inventory, Active Weapon, Armor status). |
| `!give <@user> <amount>` | `@everyone` | Transfers money from your wallet to another user. |
| `!gunset` | `@everyone` | Opens an interactive UI to equip a weapon from your inventory. |
| `!shoot <@user>` | `@everyone` | Shoots the target using your equipped weapon. Deals timeout damage based on armor. |
| `!help <@user>` | `Doctor Role` | Cures an injured (timed-out) player. Requires a Medical Injection. |
| `!tax` | `Treasury Role` | Opens a UI panel to change the server's economy tax rate. |
| `!bank take <amount>` | `Treasury Role` | Withdraws funds from the government treasury to the user's wallet. |

---

## 🛠️ Technical Details & Setup

### Requirements

* Node.js (v16.9.0 or higher)
* `discord.js` v14

### Installation

1. Clone this repository.
2. Run `npm install discord.js` in your terminal.
3. Open `index.js` (or your main file) and configure the hardcoded IDs:
* **Guild/Channel IDs:** Update `GUILD_ID`, `LOG_CHANNEL`, `HOSPITAL_CHANNEL`, and all `CHANNELS` / `CATEGORIES` objects with your server's IDs.
* **Role IDs:** Update the `ROLES` object with the corresponding Discord Role IDs for your factions and items.
* **Bot Token:** Replace `'Your_Discord_token'` at the very bottom with your actual bot token.


4. Run the bot using `node index.js`.

### Database Architecture

The bot relies on a local `database.json` file. It automatically generates and structures it on the first run.

```json
{
    "users": {
        "user_id_here": {
            "balance": 0,
            "chars": 0,
            "mp5Uses": 0,
            "homeChannel": "channel_id_here",
            "homePrice": 10000,
            "activeWeapon": "glock"
        }
    },
    "treasury": {
        "balance": 150000,
        "lastDaily": 1710000000000
    },
    "taxMode": "neutral",
    "hospitalMessages": {
        "injured_user_id": "alert_message_id"
    }
}

```

## 🔒 Security & Anti-Cheat

* **Purchase Verification:** Server-side checks ensure users cannot manipulate button interactions to buy items they cannot afford or don't have role access to.
* **Automated Data Saving:** Triggers immediately upon any transaction or state change to prevent rollback exploits.
* **Logging:** All major actions (purchases, money transfers, shooting, tax changes) are logged into a designated admin logging channel.

---

*Created for specialized Discord Roleplay mechanics.*
