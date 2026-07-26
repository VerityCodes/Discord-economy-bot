یکم کد دستی تغیر دادم

const { Client, GatewayIntentBits, Partials, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField } = require('discord.js');
const fs = require('fs');
const path = './database.json';

// --- تنظیمات و آیدی ها ---
const GUILD_ID = '1223384814598492170';
const LOG_CHANNEL = '1530508495567323261';
const HOSPITAL_CHANNEL = '1530576231899336895';

const CHANNELS = {
    mainShop: '1530160704219381790',
    darkWeb: '1530178868093255761',
    policeShop: '1530498013385068645',
    militaryShop: '1530497807474102304',
    homeNormal: '1530162662233735290',
    homeSoldier: '1530163619549937725'
};

const CATEGORIES = {
    homeNormal: '1530158003666550935',
    homeSoldier: '1530160458970038422'
};

const ROLES = {
    treasury: '1530179199887999128',
    doctor: '1530182889495466124',
    soldier: '1530181849681494046',
    airGun: '1530175308433719387',
    injection: '1530492371652055080',
    iphone: '1530178923118329957',
    glock: '1530174886792663121',
    mp5: '1530176035335966851',
    l85a3: '1530175613766471804',
    vest: '1530176923689554010',
    plateCarrier: '1530176461871513631'
};

// --- سیستم دیتابیس لوکال ---
let db = { users: {}, treasury: { balance: 0, lastDaily: 0 }, taxMode: 'neutral', hospitalMessages: {} };
if (fs.existsSync(path)) {
    db = JSON.parse(fs.readFileSync(path, 'utf-8'));
    if (!db.taxMode) db.taxMode = 'neutral';
    if (!db.hospitalMessages) db.hospitalMessages = {};
}
const saveDB = () => fs.writeFileSync(path, JSON.stringify(db, null, 4));

const getUser = (id) => {
    if (!db.users[id]) db.users[id] = { balance: 0, chars: 0, mp5Uses: 0, homeChannel: null, homePrice: 0, activeWeapon: null };
    if (!db.users[id].activeWeapon) db.users[id].activeWeapon = null;
    return db.users[id];
};

// --- اینتنت‌ها ---
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ],
    partials: [Partials.Message, Partials.Channel]
});

async function sendLog(guild, text) {
    const channel = guild.channels.cache.get(LOG_CHANNEL);
    if (channel) {
        const embed = new EmbedBuilder().setColor('Blue').setDescription(text).setTimestamp();
        channel.send({ embeds: [embed] });
    }
}

async function setupPanel(channelId, embedBuilder, components) {
    try {
        const channel = await client.channels.fetch(channelId);
        if (!channel) return;
        const messages = await channel.messages.fetch({ limit: 10 });
        const hasPanel = messages.some(m => m.author.id === client.user.id && m.embeds[0]?.title === embedBuilder.data.title);
        
        if (!hasPanel) {
            await channel.send({ embeds: [embedBuilder], components: components });
            console.log(`UI created for channel: ${channelId}`);
        }
    } catch (e) {
        console.log(`Could not setup UI in channel ${channelId}.`);
    }
}

client.once('ready', async () => {
    console.log(`Bot is online as ${client.user.tag}`);
    
    // شاپ مرکزی
    const embedMain = new EmbedBuilder().setTitle('🏪 فروشگاه مرکزی بریتانیا').setColor('Green')
        .setDescription('موجودی حساب خود را بررسی کنید و با کلیک روی دکمه‌ها خرید خود را انجام دهید.\n\n👔 **پوشاک:**\n`£1000` لباس اشرافی\n`£700` لباس کت شلوار\n`£100` لباس اسپورت\n\n🛠️ **لوازم:**\n`£500` Air Gun BSA R-10 SE\n`£70` آمپول درمانی (پزشکان £10)\n`£700` گوشی IPhone');
    const r1 = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('buy_clothes_aristo').setLabel('لباس اشرافی').setStyle(ButtonStyle.Secondary).setEmoji('⚜️'),
        new ButtonBuilder().setCustomId('buy_clothes_suit').setLabel('کت و شلوار').setStyle(ButtonStyle.Secondary).setEmoji('👔'),
        new ButtonBuilder().setCustomId('buy_clothes_sport').setLabel('اسپورت').setStyle(ButtonStyle.Secondary).setEmoji('👕')
    );
    const r2 = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('buy_airgun').setLabel('BSA R-10 SE').setStyle(ButtonStyle.Danger).setEmoji('🔫'),
        new ButtonBuilder().setCustomId('buy_medic').setLabel('آمپول درمانی').setStyle(ButtonStyle.Success).setEmoji('💉'),
        new ButtonBuilder().setCustomId('buy_iphone').setLabel('IPhone').setStyle(ButtonStyle.Primary).setEmoji('📱')
    );
    await setupPanel(CHANNELS.mainShop, embedMain, [r1, r2]);

    // دارک وب
    const embedDark = new EmbedBuilder().setTitle('🕸️ بازار سیاه (دارک وب)').setColor('NotQuiteBlack')
        .setDescription('ورود به این بخش جرم است! خرید سلاح‌های قاچاق.\n\n🔫 **تسلیحات:**\n`£2500` Glock 17\n`£800` MP5 (قاچاق - ۷ بار مصرف)\n`£10,000` L85A3\n\n🛡️ **زره:**\n`£1000` جلیقه پلیس\n`£3000` پلیت کریر');
    const dwRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('buy_glock').setLabel('Glock 17').setStyle(ButtonStyle.Danger),
        new ButtonBuilder().setCustomId('buy_mp5_dw').setLabel('MP5 (قاچاق)').setStyle(ButtonStyle.Danger),
        new ButtonBuilder().setCustomId('buy_l85a3_dw').setLabel('L85A3').setStyle(ButtonStyle.Danger),
        new ButtonBuilder().setCustomId('buy_vest_dw').setLabel('جلیقه پلیس').setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId('buy_plate_dw').setLabel('پلیت کریر').setStyle(ButtonStyle.Secondary)
    );
    await setupPanel(CHANNELS.darkWeb, embedDark, [dwRow]);

    // انبار پلیس
    const embedPol = new EmbedBuilder().setTitle('🚓 انبار تجهیزات پلیس').setColor('Blue')
        .setDescription('مخصوص نیروهای پلیس.\nخرید سلاح و زره سازمانی به صورت دائمی.\n\n**تجهیزات:**\n`£500` MP5 سازمانی\n`£500` جلیقه ضدگلوله');
    const polRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('buy_mp5_legal').setLabel('MP5 (دائمی)').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('buy_vest_legal').setLabel('جلیقه ضدگلوله').setStyle(ButtonStyle.Primary)
    );
    await setupPanel(CHANNELS.policeShop, embedPol, [polRow]);

    // انبار نظامی
    const embedMil = new EmbedBuilder().setTitle('🪖 انبار تجهیزات ارتش').setColor('DarkGreen')
        .setDescription('مخصوص نیروهای ارتش بریتانیا.\n\n**تجهیزات:**\n`£1000` سلاح جنگی L85A3\n`£1000` زره جنگی Plate Carrier');
    const milRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('buy_l85a3_legal').setLabel('L85A3 (سازمانی)').setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId('buy_plate_legal').setLabel('Plate Carrier').setStyle(ButtonStyle.Success)
    );
    await setupPanel(CHANNELS.militaryShop, embedMil, [milRow]);

    // بنگاه املاک معمولی
    const embedHome = new EmbedBuilder().setTitle('🏘️ بنگاه املاک شهر').setColor('Aqua')
        .setDescription('با خرید خانه یک چنل اختصاصی برای شما ساخته می‌شود.\n\nقیمت: `£10,000`');
    const rowHome = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('buy_home_normal').setLabel('خرید خانه').setStyle(ButtonStyle.Success));
    await setupPanel(CHANNELS.homeNormal, embedHome, [rowHome]);

    // مسکن نظامی
    const embedSoldierHome = new EmbedBuilder().setTitle('🏕️ مسکن ویژه سربازان').setColor('Gold')
        .setDescription('خرید خانه ویژه سربازان بریتانیا با ۵۰٪ تخفیف.\n\nقیمت: `£5,000`');
    const rowSoldierHome = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('buy_home_soldier').setLabel('خرید خانه (ویژه)').setStyle(ButtonStyle.Success));
    await setupPanel(CHANNELS.homeSoldier, embedSoldierHome, [rowSoldierHome]);

    // یارانه روزانه
    setInterval(() => {
        const now = Date.now();
        if (now - db.treasury.lastDaily >= 86400000) {
            db.treasury.balance += 10000;
            db.treasury.lastDaily = now;
            saveDB();
            const guild = client.guilds.cache.get(GUILD_ID);
            if (guild) sendLog(guild, `💰 مبلغ 100,000 پوند یارانه روزانه به خزانه واریز شد.`);
        }
    }, 60000);
});

// --- رصد تغییرات ممبرها برای تشخیص تایم‌اوت و درمان ---
client.on('guildMemberUpdate', async (oldMember, newMember) => {
    if (newMember.guild.id !== GUILD_ID) return;

    const hospitalChannel = newMember.guild.channels.cache.get(HOSPITAL_CHANNEL);
    if (!hospitalChannel) return;

    const wasTimedOut = oldMember.communicationDisabledUntilTimestamp && oldMember.communicationDisabledUntilTimestamp > Date.now();
    const isTimedOut = newMember.communicationDisabledUntilTimestamp && newMember.communicationDisabledUntilTimestamp > Date.now();

    // حالت اول: کاربر تازه تایم‌اوت شده است (مجروح شده)
    if (!wasTimedOut && isTimedOut) {
        try {
            const embed = new EmbedBuilder()
                .setTitle('🚨 اعلام وضعیت اضطراری - بیمارستان')
                .setColor('Red')
                .setDescription(`شخص ${newMember} (<@${newMember.id}>) مجروح شده و به بیمارستان منتقل شد!`)
                .setTimestamp();

            const sentMsg = await hospitalChannel.send({
                content: `<@&${ROLES.doctor}> ${newMember}`,
                embeds: [embed]
            });

            db.hospitalMessages[newMember.id] = sentMsg.id;
            saveDB();
        } catch (e) {
            console.error("Error sending hospital alert:", e);
        }
    }

    // حالت دوم: تایم‌اوت کاربر برداشته شده (درمان شده)
    if (wasTimedOut && !isTimedOut) {
        if (db.hospitalMessages[newMember.id]) {
            try {
                const msgId = db.hospitalMessages[newMember.id];
                const msg = await hospitalChannel.messages.fetch(msgId).catch(() => null);
                if (msg) {
                    await msg.delete();
                }
            } catch (e) {
                console.error("Error deleting hospital message:", e);
            }
            delete db.hospitalMessages[newMember.id];
            saveDB();
        }
    }
});

// --- هندل پیام‌ها (اقتصاد جدید، کامندها و سیستم مالیات) ---
client.on('messageCreate', async (message) => {
    if (message.guild?.id !== GUILD_ID || message.author.bot) return;

    const user = getUser(message.author.id);

    // سیستم اقتصاد جدید با محاسبه دقیق کاراکترها و سیستم مالیات جدید
    user.chars += message.content.length;
    if (user.chars >= 5) {
        let units = Math.floor(user.chars / 5);
        user.chars = user.chars % 5;

        if (db.taxMode === 'positive') {
            // مالیات مثبت: هر ۵ کاراکتر ۱۰۰ پوند میره تو جیب دولت
            db.treasury.balance += (units * 100);
        } else if (db.taxMode === 'neutral') {
            // مالیات خنثی: ۵۰ پوند جیب مردم، ۵۰ پوند جیب دولت
            user.balance += (units * 50);
            db.treasury.balance += (units * 50);
        } else if (db.taxMode === 'negative') {
            // مالیات منفی: ۱۰۰ پوند میره تو جیب مردم
            user.balance += (units * 100);
            db.treasury.balance -= (units * 50);
            if (db.treasury.balance < 0) db.treasury.balance = 0;
        }
        saveDB();
    }

    const args = message.content.split(' ');
    const command = args[0].toLowerCase();

    // کامند پنل دکمه‌ای مالیات (مخصوص نخست وزیر / خزانه)
    if (command === '!tax') {
        if (!message.member.roles.cache.has(ROLES.treasury)) {
            return message.reply("❌ شما به مقام نخست‌وزیری/خزانه دسترسی ندارید!");
        }

        const currentTaxText = db.taxMode === 'positive' ? 'مثبت (📈 - ۱۰۰ پوند دولت)' : db.taxMode === 'negative' ? 'منفی (📉 - ۱۰۰ پوند مردم)' : 'خنثی (⚖️ - ۵۰ پوند مردم و ۵۰ پوند دولت)';

        const embed = new EmbedBuilder()
            .setTitle('🏛️ مدیریت سیستم مالیاتی کشور')
            .setColor('Gold')
            .setDescription(`حالت فعلی مالیات: **${currentTaxText}**\n\nلطفاً از میان گزینه‌های زیر وضعیت جدید مالیات را انتخاب کنید:`);

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('tax_mode_positive').setLabel('مثبت').setStyle(ButtonStyle.Danger).setEmoji('📈'),
            new ButtonBuilder().setCustomId('tax_mode_neutral').setLabel('خنثی').setStyle(ButtonStyle.Secondary).setEmoji('⚖️'),
            new ButtonBuilder().setCustomId('tax_mode_negative').setLabel('منفی').setStyle(ButtonStyle.Success).setEmoji('📉')
        );

        return message.reply({ embeds: [embed], components: [row] });
    }

    // کامند مشاهده پروفایل و اطلاعات کامل (!view)
    if (command === '!view') {
        const target = message.mentions.members.first() || message.member;
        const targetData = getUser(target.id);
        
        // نام کاربر
        const userName = target.user.username;
        
        // مقدار پول
        const balance = `£${targetData.balance}`;
        
        // آیتم‌هایی که دارد
        let items = [];
        if (target.roles.cache.has(ROLES.iphone)) items.push('📱 گوشی آیفون');
        if (target.roles.cache.has(ROLES.injection)) items.push('💉 آمپول درمانی');
        if (target.roles.cache.has(ROLES.airGun)) items.push('🔫 Air Gun BSA R-10 SE');
        if (target.roles.cache.has(ROLES.glock)) items.push('🔫 Glock 17');
        if (target.roles.cache.has(ROLES.mp5)) items.push(`🔫 MP5 (${targetData.mp5Uses === -1 ? 'دائمی' : targetData.mp5Uses + ' تیر'})`);
        if (target.roles.cache.has(ROLES.l85a3)) items.push('🔫 L85A3');
        if (target.roles.cache.has(ROLES.vest)) items.push('🛡️ جلیقه پلیس/ضدگلوله');
        if (target.roles.cache.has(ROLES.plateCarrier)) items.push('🛡️ پلیت کریر');
        if (targetData.homeChannel) items.push(`🏠 خانه (<#${targetData.homeChannel}>)`);
        
        const itemsList = items.length > 0 ? items.join('\n') : 'هیچ آیتمی ندارد';
        
        // تفنگی که ست کرده
        let activeWep = 'پیش‌فرض (قوی‌ترین)';
        if (targetData.activeWeapon === 'l85a3') activeWep = 'L85A3';
        else if (targetData.activeWeapon === 'glock') activeWep = 'Glock 17';
        else if (targetData.activeWeapon === 'mp5') activeWep = 'MP5';
        else if (targetData.activeWeapon === 'airgun') activeWep = 'Air Gun';
        
        // آرموری که ازش محافظت میکنه
        let activeArmor = 'ندارد';
        if (target.roles.cache.has(ROLES.plateCarrier)) activeArmor = 'Plate Carrier (زره سنگین)';
        else if (target.roles.cache.has(ROLES.vest)) activeArmor = 'جلیقه ضدگلوله';

        const embed = new EmbedBuilder()
            .setTitle(`👤 اطلاعات کامل ${userName}`)
            .setColor('Blue')
            .setDescription(
                `- 📍**نام:** ${target.user.tag}\n` +
                `- 📍**مقدار پول:** ${balance}\n\n` +
                `- 📍**آیتم‌هایی که داره:**\n${itemsList}\n\n` +
                `- 📍**تفنگی که ست کرده:** ${activeWep}\n` +
                `- 📍**آرموری که ازش محافظت میکنه:** ${activeArmor}`
            )
            .setImage('https://cdn.discordapp.com/attachments/1219732390646382654/1228995364955361321/ggnudehup_1-1_1.gif?ex=6a65cea0&is=6a647d20&hm=666b0b62122f39b6b50f97b1af6fa06e831c7d51cab8f9c8e8bb657e40fe9794')
            .setTimestamp();

        return message.reply({ embeds: [embed] });
    }
    
    // کامند انتقال پول
    if (command === '!give') {
        const target = message.mentions.members.first();
        const amount = parseInt(args[2]);

        if (!target) return message.reply("لطفاً شخصی که می‌خواهید به او پول بدهید را منشن کنید!\nمثال: `!give @user 100`");
        if (target.id === message.author.id) return message.reply("شما نمی‌توانید به خودتان پول بدهید!");
        if (isNaN(amount) || amount <= 0) return message.reply("لطفاً یک مبلغ معتبر وارد کنید!\nمثال: `!give @user 100`");
        
        if (user.balance < amount) return message.reply(`❌ موجودی شما کافی نیست! موجودی فعلی شما: £${user.balance}`);

        const targetUser = getUser(target.id);
        user.balance -= amount;
        targetUser.balance += amount;
        saveDB();

        message.reply(`✅ شما با موفقیت مبلغ **£${amount}** را به ${target} انتقال دادید.`);
        sendLog(message.guild, `💸 ${message.author} مبلغ **£${amount}** به ${target} انتقال داد.`);
        return;
    }

    // کامند منوی انتخاب سلاح (!gunset)
    if (command === '!gunset') {
        const embed = new EmbedBuilder()
            .setTitle('🔫 انتخاب سلاح فعال')
            .setColor('DarkBlue')
            .setDescription('لطفاً از میان سلاح‌هایی که در اختیار دارید، یکی را برای استفاده در دستور `!shoot` انتخاب کنید:');

        const row1 = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('set_weapon_l85a3').setLabel('L85A3').setStyle(ButtonStyle.Danger),
            new ButtonBuilder().setCustomId('set_weapon_glock').setLabel('Glock 17').setStyle(ButtonStyle.Danger),
            new ButtonBuilder().setCustomId('set_weapon_mp5').setLabel('MP5').setStyle(ButtonStyle.Danger)
        );

        const row2 = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('set_weapon_airgun').setLabel('Air Gun').setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId('set_weapon_none').setLabel('برداشتن سلاح (پیش‌فرض)').setStyle(ButtonStyle.Success)
        );

        return message.reply({ embeds: [embed], components: [row1, row2] });
    }
    
    // کامند شلیک
    if (command === '!shoot') {
        const target = message.mentions.members.first();
        if (!target) return message.reply("لطفا یک نفر را منشن کنید!");

        const shooter = message.member;
        let baseTime = 0;
        let weaponUsed = '';
        let selectedWeapon = user.activeWeapon;

        if (selectedWeapon === 'l85a3' && shooter.roles.cache.has(ROLES.l85a3)) { baseTime = 7 * 24 * 60 * 60 * 1000; weaponUsed = 'L85A3'; }
        else if (selectedWeapon === 'glock' && shooter.roles.cache.has(ROLES.glock)) { baseTime = 3600000; weaponUsed = 'Glock 17'; }
        else if (selectedWeapon === 'mp5' && shooter.roles.cache.has(ROLES.mp5)) { baseTime = 3600000; weaponUsed = 'MP5'; }
        else if (selectedWeapon === 'airgun' && shooter.roles.cache.has(ROLES.airGun)) { baseTime = 60000; weaponUsed = 'Air Gun'; }
        else {
            if (shooter.roles.cache.has(ROLES.l85a3)) { baseTime = 7 * 24 * 60 * 60 * 1000; weaponUsed = 'L85A3'; }
            else if (shooter.roles.cache.has(ROLES.glock)) { baseTime = 3600000; weaponUsed = 'Glock 17'; }
            else if (shooter.roles.cache.has(ROLES.mp5)) { baseTime = 3600000; weaponUsed = 'MP5'; }
            else if (shooter.roles.cache.has(ROLES.airGun)) { baseTime = 60000; weaponUsed = 'Air Gun'; }
            else return message.reply("شما هیچ سلاحی برای شلیک ندارید!");
        }

        let finalTime = baseTime;
        if (target.roles.cache.has(ROLES.plateCarrier)) {
            if (weaponUsed === 'L85A3') finalTime = 3600000; 
            else finalTime = 0; 
        } else if (target.roles.cache.has(ROLES.vest)) {
            if (weaponUsed !== 'L85A3') finalTime = 5000; 
        }

        if (weaponUsed === 'MP5' && user.mp5Uses > 0) {
            user.mp5Uses--;
            if (user.mp5Uses === 0) shooter.roles.remove(ROLES.mp5);
            saveDB();
        } else if (weaponUsed === 'MP5' && user.mp5Uses === 0) {
            shooter.roles.remove(ROLES.mp5);
            return message.reply("خشاب تفنگ MP5 قاچاق شما خالی شده است!");
        }

        if (finalTime > 0) {
            try {
                await target.timeout(finalTime, `Shot by ${shooter.user.tag}`);
                message.reply(`شما به ${target} با ${weaponUsed} شلیک کردید!`);
                sendLog(message.guild, `🔫 ${shooter} به ${target} با **${weaponUsed}** شلیک کرد.`);
            } catch(e) { message.reply("خطا در اعمال تایم‌اوت."); }
        } else {
            message.reply(`${target} آرمور قوی دارد و تیر شما اثری نداشت!`);
        }
        return;
    }

    if (command === '!help') {
        const target = message.mentions.members.first();
        if (!target) return message.reply("شخصی را منشن کنید.");
        if (!message.member.roles.cache.has(ROLES.injection)) return message.reply("شما آیتم درمانی را ندارید.");
        try {
            await target.timeout(null);
            await message.member.roles.remove(ROLES.injection);
            message.reply(`با موفقیت ${target} درمان شد.`);
        } catch(e) { message.reply("مشکلی در درمان رخ داد."); }
        return;
    }

    if (command === '!bank') {
        if (!message.member.roles.cache.has(ROLES.treasury)) return message.reply("دسترسی ندارید.");
        if (args[1] === 'take' && !isNaN(args[2])) {
            let amount = parseInt(args[2]);
            if (db.treasury.balance >= amount) {
                db.treasury.balance -= amount;
                user.balance += amount;
                saveDB();
                message.reply(`مبلغ £${amount} از خزانه برداشت شد.`);
            } else { message.reply("موجودی خزانه کافی نیست."); }
        } else { message.reply(`موجودی خزانه: £${db.treasury.balance}\nبرداشت: \`!bank take <مبلغ>\``); }
        return;
    }
});

// --- هندل دکمه‌های رابط کاربری (خریدها، منوی سلاح و تغییر مالیات) ---
client.on('interactionCreate', async interaction => {
    if (!interaction.isButton()) return;
    const user = getUser(interaction.user.id);
    const member = interaction.member;

    if (interaction.customId.startsWith('tax_mode_')) {
        if (!member.roles.cache.has(ROLES.treasury)) {
            return interaction.reply({ content: "❌ شما به مقام نخست‌وزیری/خزانه دسترسی ندارید!", ephemeral: true });
        }

        const mode = interaction.customId.replace('tax_mode_', '');
        let modeName = '';

        if (mode === 'positive') {
            db.taxMode = 'positive';
            modeName = '📈 مثبت (۱۰۰ پوند به دولت، ۰ به مردم)';
        } else if (mode === 'neutral') {
            db.taxMode = 'neutral';
            modeName = '⚖️ خنثی (۵۰ پوند به مردم و ۵۰ پوند به دولت)';
        } else if (mode === 'negative') {
            db.taxMode = 'negative';
            modeName = '📉 منفی (۱۰۰ پوند به مردم)';
        }

        saveDB();
        sendLog(interaction.guild, `🏛️ ${interaction.user} حالت مالیات سرور را به **${modeName}** تغییر داد.`);
        return interaction.reply({ content: `✅ حالت مالیات سرور با موفقیت تغییر کرد به: **${modeName}**`, ephemeral: true });
    }

    if (interaction.customId.startsWith('set_weapon_')) {
        const weaponType = interaction.customId.replace('set_weapon_', '');
        let roleIdToCheck = null;
        let weaponName = '';

        if (weaponType === 'l85a3') { roleIdToCheck = ROLES.l85a3; weaponName = 'L85A3'; }
        else if (weaponType === 'glock') { roleIdToCheck = ROLES.glock; weaponName = 'Glock 17'; }
        else if (weaponType === 'mp5') { roleIdToCheck = ROLES.mp5; weaponName = 'MP5'; }
        else if (weaponType === 'airgun') { roleIdToCheck = ROLES.airGun; weaponName = 'Air Gun'; }
        else if (weaponType === 'none') {
            user.activeWeapon = null;
            saveDB();
            return interaction.reply({ content: "✅ سلاح فعال شما برداشته شد.", ephemeral: true });
        }

        if (!member.roles.cache.has(roleIdToCheck)) {
            return interaction.reply({ content: `❌ شما سلاح **${weaponName}** را ندارید و نمی‌توانید آن را انتخاب کنید!`, ephemeral: true });
        }

        user.activeWeapon = weaponType;
        saveDB();
        return interaction.reply({ content: `✅ سلاح فعال شما با موفقیت روی **${weaponName}** تنظیم شد!`, ephemeral: true });
    }

    async function processPurchase(price, successAction, itemLogName) {
        if (user.balance < price) return interaction.reply({ content: `❌ موجودی ناکافی! شما به £${price} نیاز دارید.`, ephemeral: true });
        user.balance -= price;
        saveDB();
        await successAction();
        interaction.reply({ content: `✅ شما **${itemLogName}** را با موفقیت خریدید!`, ephemeral: true });
        sendLog(interaction.guild, `🛒 ${interaction.user} آیتم **${itemLogName}** را به قیمت £${price} خریداری کرد.`);
    }

    async function changeNick(prefix) {
        let currentNick = member.nickname || interaction.user.username;
        currentNick = currentNick.replace(/^(⚜️|⊰|୨)\s*/, '');
        try { await member.setNickname(`${prefix} ${currentNick}`.substring(0, 32)); } 
        catch(e) {}
    }

    // شاپ مرکزی
    if (interaction.customId === 'buy_clothes_aristo') processPurchase(1000, () => changeNick('⚜️'), 'لباس اشرافی');
    if (interaction.customId === 'buy_clothes_suit') processPurchase(700, () => changeNick('⊰'), 'لباس کت شلوار');
    if (interaction.customId === 'buy_clothes_sport') processPurchase(100, () => changeNick('୨'), 'لباس اسپورت');
    if (interaction.customId === 'buy_airgun') processPurchase(500, () => member.roles.add(ROLES.airGun), 'BSA R-10 SE');
    if (interaction.customId === 'buy_iphone') processPurchase(700, () => member.roles.add(ROLES.iphone), 'IPhone');
    if (interaction.customId === 'buy_medic') {
        const price = member.roles.cache.has(ROLES.doctor) ? 10 : 70;
        processPurchase(price, () => member.roles.add(ROLES.injection), 'Therapeutic injection');
    }

    // دارک وب
    if (interaction.customId === 'buy_glock') processPurchase(2500, () => member.roles.add(ROLES.glock), 'Glock 17');
    if (interaction.customId === 'buy_mp5_dw') processPurchase(800, () => { member.roles.add(ROLES.mp5); user.mp5Uses = 7; saveDB(); }, 'MP5 (قاچاق)');
    if (interaction.customId === 'buy_l85a3_dw') processPurchase(10000, () => member.roles.add(ROLES.l85a3), 'L85A3');
    if (interaction.customId === 'buy_vest_dw') processPurchase(1000, () => member.roles.add(ROLES.vest), 'Ballistic Vest');
    if (interaction.customId === 'buy_plate_dw') processPurchase(3000, () => member.roles.add(ROLES.plateCarrier), 'Plate Carrier');

    // پلیس
    if (interaction.customId === 'buy_mp5_legal') processPurchase(500, () => { member.roles.add(ROLES.mp5); user.mp5Uses = -1; saveDB(); }, 'MP5 (سازمانی)');
    if (interaction.customId === 'buy_vest_legal') processPurchase(500, () => member.roles.add(ROLES.vest), 'Ballistic Vest (سازمانی)');

    // نظامی
    if (interaction.customId === 'buy_l85a3_legal') processPurchase(1000, () => member.roles.add(ROLES.l85a3), 'L85A3 (سازمانی)');
    if (interaction.customId === 'buy_plate_legal') processPurchase(1000, () => member.roles.add(ROLES.plateCarrier), 'Plate Carrier (سازمانی)');

    // املاک
    if (interaction.customId.startsWith('buy_home')) {
        if (user.homeChannel) return interaction.reply({ content: "شما در حال حاضر یک خانه دارید!", ephemeral: true });

        const isSoldier = interaction.customId === 'buy_home_soldier';
        if (isSoldier && !member.roles.cache.has(ROLES.soldier)) return interaction.reply({ content: "شما سرباز نیستید!", ephemeral: true });

        const price = isSoldier ? 5000 : 10000;
        const category = isSoldier ? CATEGORIES.homeSoldier : CATEGORIES.homeNormal;

        if (user.balance < price) return interaction.reply({ content: `موجودی ناکافی. £${price} نیاز است.`, ephemeral: true });

        try {
            const channel = await interaction.guild.channels.create({
                name: `home-${interaction.user.username}`,
                parent: category,
                permissionOverwrites: [
                    { id: interaction.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
                    { id: interaction.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] }
                ]
            });

            user.balance -= price;
            user.homeChannel = channel.id;
            user.homePrice = price;
            saveDB();

            interaction.reply({ content: `✅ خانه شما با موفقیت ساخته شد: ${channel}`, ephemeral: true });
            sendLog(interaction.guild, `🏠 ${interaction.user} یک خانه به قیمت £${price} خرید.`);
        } catch (error) {
            console.error(error);
            interaction.reply({ content: "خطا در ساخت کانال خانه.", ephemeral: true });
        }
    }
});

client.login('Your_Discord_token');
