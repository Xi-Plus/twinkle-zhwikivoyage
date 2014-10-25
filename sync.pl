#!/usr/bin/perl 

use v5.10;

use Git::Repository;
use MediaWiki::Bot;
use File::Slurp;
use Getopt::Long::Descriptive;
use Encode;
use utf8;

my $config_file = "$ENV{HOME}/.mwbotrc";
my $c = {do "$config_file"} if -f $config_file;

my ($opt, $usage) = describe_options(
    "$0 %o <files...>",
    [ 'username|u=s', "username for account on wikivoyage", {default => $c->{username} // ""} ],
    [ 'password|p=s', "password for account on wikivoyage (do not use)", {default => $c->{password} // ""} ],
    [ 'base|b=s', "base location on wikivoyage where files exist (default User:AzaToth or entry in .mwbotrc)", {default => $c->{base} // "User:Zhuyifei1999/Twinkle"} ],
    [ 'lang=s', 'Target language', {default => 'zh'} ],
    [ 'family=s', 'Target family', {default => 'wikivoyage'} ],
    [ 'mode' => hidden =>
        {
            required => 1,
            one_of => [
                ["pull" => "pull changes from wikivoyage"],
                ["push" => "push changes to wikivoyage"],
                ["deploy" => "push changes to wikivoyage as gadgets"]
            ] 
        } 
    ],
    [ 'strip', "strip line end spaces"],
    [],
    [ 'verbose|v',  "print extra stuff"            ],
    [ 'help',       "print usage message and exit" ],
);

print($usage->text), exit if $opt->help || !scalar(@ARGV);

my %pages = map +("$opt->{base}/$_" => $_), @ARGV;
my %deploys = (
	'moment.js' => 'MediaWiki:Gadget-moment.js',
	'twinkle.js' => 'MediaWiki:Gadget-Twinkle.js',
	'morebits.js' => 'MediaWiki:Gadget-morebits.js',
	'morebits.css' => 'MediaWiki:Gadget-morebits.css',
	'modules/friendlytag.js' => 'MediaWiki:Gadget-friendlytag.js',
	'modules/friendlytalkback.js' => 'MediaWiki:Gadget-friendlytalkback.js',
	'modules/twinkleclose.js' => 'MediaWiki:Gadget-twinkleclose.js',
	'modules/twinkleconfig.js' => 'MediaWiki:Gadget-twinkleconfig.js',
	'modules/twinklecopyvio.js' => 'MediaWiki:Gadget-twinklecopyvio.js',
	'modules/twinklediff.js' => 'MediaWiki:Gadget-twinklediff.js',
	'modules/twinklefluff.js' => 'MediaWiki:Gadget-twinklefluff.js',
	'modules/twinklespeedy.js' => 'MediaWiki:Gadget-twinklespeedy.js',
	'modules/twinkleunlink.js' => 'MediaWiki:Gadget-twinkleunlink.js',
	'modules/twinklexfd.js' => 'MediaWiki:Gadget-twinklexfd.js',
);

# Config file should be an hash consisting of username and password keys

my $repo = Git::Repository->new();


my $bot = MediaWiki::Bot->new({
        assert      => 'user',
        protocol    => 'https',
        host        => "$opt->{lang}.$opt->{family}.org",
        login_data  => { username => $opt->username, password => $opt->password},
        debug => $opt->{verbose} ? 2 : 0,
		maxlag => 1000000 # not a botty script, thus smash it!
    }
);

if( $opt->mode eq "pull" ) {
    my @status = $repo->run( status => '--porcelain');

    if( scalar @status ) {
        say "repository is not clean. aborting...";
		#exit;
    }

    while(my($page, $file) = each %pages) {
        say "Grabbing $page";
        my $text = $bot->get_text($page);
        $text =~ s/\h+$//mg if $opt->{'strip'};
        write_file( $file, {binmode => ':raw' }, encode('UTF-8',$text));
    }
    my $cmd = $repo->command( diff => '--stat', '--color' );
    my $s = $cmd->stdout;
    while (<$s>) {
        say $_;
    }
    $cmd->close;
} elsif( $opt->mode eq "push" ) {
    while(my($page, $file) = each %pages) {
        my $tag = $repo->run(describe => '--always', '--all', '--dirty');
        my $log = $repo->run(log => '-1', '--oneline', '--no-color', $file);
        $tag =~ m{(?:heads/)?(?<branch>.+)};
        my $text = read_file($file,  {binmode => ':raw' });
        $bot->edit({
                page    => $page,
                text    => decode("UTF-8", $text),
                summary => "$+{branch}",
            });
    }
} elsif( $opt->mode eq "deploy" ) {
    foreach my $file (values %pages) {
		unless(defined $deploys{$file}) {
			die "file not deployable";
		}
		$page = $deploys{$file};
		say "$file -> https://$opt->{lang}.$opt->{family}.org/wiki/$page";
        my $tag = $repo->run(describe => '--always', '--dirty');
        my $log = $repo->run(log => '-1', '--pretty=format:%s', '--no-color');
        my $text = read_file($file,  {binmode => ':raw' });
        my $ret = $bot->edit({
                page    => $page,
                text    => decode("UTF-8", $text),
                summary => "$tag",
            });
		unless($ret) {
			die "Error $bot->{error}->{code}: $bot->{error}->{details}";
		}
    }
}
